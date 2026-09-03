import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  archiveProject: vi.fn(),
  createProject: vi.fn(),
  getDatabase: vi.fn(() => ({ kind: "database" })),
  redirect: vi.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
  requireOwner: vi.fn(),
  revalidatePath: vi.fn(),
  updateProject: vi.fn(),
}));

vi.mock("@kershell/db/client", () => ({ getDatabase: mocks.getDatabase }));
vi.mock("@kershell/db/repositories/projects", () => ({
  archiveProject: mocks.archiveProject,
  createProject: mocks.createProject,
  updateProject: mocks.updateProject,
}));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("@/lib/auth/owner-session", () => ({
  requireOwner: mocks.requireOwner,
}));

import {
  archiveProjectAction,
  createProjectAction,
  updateProjectAction,
} from "@/app/(dashboard)/dashboard/vault/actions";

const projectId = "20000000-0000-4000-8000-000000000001";

function validFormData() {
  const formData = new FormData();
  formData.set("code", "PRIVATE_OPS");
  formData.set("color", "#B4F23F");
  formData.set("name", "Private Operations");
  formData.set("stage", "Planning");
  formData.set("startedOn", "");
  formData.set("status", "BETA");
  formData.set("summary", "Private operations platform.");
  formData.set("technologies", "Next.js, PostgreSQL");
  return formData;
}

describe("project server actions", () => {
  beforeEach(() => {
    mocks.archiveProject.mockReset();
    mocks.createProject.mockReset();
    mocks.redirect.mockClear();
    mocks.requireOwner.mockReset();
    mocks.revalidatePath.mockClear();
    mocks.updateProject.mockReset();
  });

  it("rejects direct invocation before touching the database", async () => {
    mocks.requireOwner.mockRejectedValue(new Error("unauthorized"));

    await expect(
      createProjectAction({}, validFormData()),
    ).rejects.toThrow("unauthorized");
    expect(mocks.createProject).not.toHaveBeenCalled();
  });

  it("validates untrusted form data before writing", async () => {
    mocks.requireOwner.mockResolvedValue({ ownerId: "owner-one" });
    const invalid = validFormData();
    invalid.set("code", "not valid!");

    await expect(createProjectAction({}, invalid)).resolves.toMatchObject({
      message: expect.any(String),
    });
    expect(mocks.createProject).not.toHaveBeenCalled();
  });

  it("passes only validated data and the authenticated owner scope", async () => {
    mocks.requireOwner.mockResolvedValue({ ownerId: "owner-one" });
    mocks.createProject.mockResolvedValue("project-one");

    await expect(
      createProjectAction({}, validFormData()),
    ).rejects.toThrow("NEXT_REDIRECT");
    expect(mocks.createProject).toHaveBeenCalledWith(
      { kind: "database" },
      "owner-one",
      expect.objectContaining({
        code: "PRIVATE_OPS",
        technologies: ["Next.js", "PostgreSQL"],
      }),
    );
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/dashboard/vault");
    expect(mocks.redirect).toHaveBeenCalledWith(
      "/dashboard/vault?notice=created",
    );
  });

  it("scopes update and archive actions to the authenticated owner", async () => {
    mocks.requireOwner.mockResolvedValue({ ownerId: "owner-one" });
    mocks.updateProject.mockResolvedValue(true);
    mocks.archiveProject.mockResolvedValue(true);

    await expect(
      updateProjectAction(projectId, {}, validFormData()),
    ).rejects.toThrow("NEXT_REDIRECT");
    expect(mocks.updateProject).toHaveBeenCalledWith(
      { kind: "database" },
      "owner-one",
      projectId,
      expect.objectContaining({ code: "PRIVATE_OPS" }),
    );
    expect(mocks.redirect).toHaveBeenCalledWith(
      `/dashboard/vault/${projectId}?notice=updated`,
    );

    mocks.redirect.mockClear();
    await expect(
      archiveProjectAction(projectId),
    ).rejects.toThrow("NEXT_REDIRECT");
    expect(mocks.archiveProject).toHaveBeenCalledWith(
      { kind: "database" },
      "owner-one",
      projectId,
    );
    expect(mocks.redirect).toHaveBeenCalledWith(
      "/dashboard/vault?notice=archived",
    );
  });
});

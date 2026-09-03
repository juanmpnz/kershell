import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createProject: vi.fn(),
  getDatabase: vi.fn(() => ({ kind: "database" })),
  redirect: vi.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
  requireOwner: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("@kershell/db/client", () => ({ getDatabase: mocks.getDatabase }));
vi.mock("@kershell/db/repositories/projects", () => ({
  createProject: mocks.createProject,
}));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("@/lib/auth/owner-session", () => ({
  requireOwner: mocks.requireOwner,
}));

import { createProjectAction } from "@/app/(dashboard)/dashboard/vault/actions";

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
    mocks.createProject.mockReset();
    mocks.redirect.mockClear();
    mocks.requireOwner.mockReset();
    mocks.revalidatePath.mockClear();
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
  });
});

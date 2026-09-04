import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  create: vi.fn(),
  database: vi.fn(() => "db"),
  delete: vi.fn(),
  redirect: vi.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
  revalidate: vi.fn(),
  requireOwner: vi.fn(),
  update: vi.fn(),
}));

vi.mock("@kershell/db/client", () => ({ getDatabase: mocks.database }));
vi.mock("@kershell/db/repositories/credential-references", () => ({
  createCredentialReference: mocks.create,
  deleteCredentialReference: mocks.delete,
  updateCredentialReference: mocks.update,
}));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidate }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("@/lib/auth/owner-session", () => ({
  requireOwner: mocks.requireOwner,
}));

import {
  createCredentialAction,
  deleteCredentialAction,
  updateCredentialAction,
} from "@/app/(dashboard)/dashboard/vault/[projectId]/credentials/actions";

const projectId = "20000000-0000-4000-8000-000000000001";
const referenceId = "50000000-0000-4000-8000-000000000001";

function payload() {
  const data = new FormData();
  data.set("name", "Production login");
  data.set("service", "Coolify");
  data.set("environment", "PRODUCTION");
  data.set("credentialType", "LOGIN");
  data.set("secretProvider", "ONEPASSWORD");
  data.set("externalItemId", "vault-item-001");
  data.set("rotationIntervalDays", "90");
  return data;
}

describe("credential reference server actions", () => {
  beforeEach(() => Object.values(mocks).forEach((mock) => mock.mockClear()));

  it("rejects direct invocation before database access", async () => {
    mocks.requireOwner.mockRejectedValue(new Error("unauthorized"));

    await expect(createCredentialAction(projectId, {}, payload())).rejects.toThrow(
      "unauthorized",
    );
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("creates a sanitized reference for the authenticated owner", async () => {
    mocks.requireOwner.mockResolvedValue({ ownerId: "owner-one" });
    mocks.create.mockResolvedValue(referenceId);

    await expect(createCredentialAction(projectId, {}, payload())).rejects.toThrow(
      "NEXT_REDIRECT",
    );
    expect(mocks.create).toHaveBeenCalledWith(
      "db",
      "owner-one",
      expect.objectContaining({
        externalItemId: "vault-item-001",
        projectId,
      }),
    );
    expect(Object.keys(mocks.create.mock.calls[0][2])).not.toEqual(
      expect.arrayContaining(["password", "secretValue", "tokenValue"]),
    );
  });

  it("scopes updates and deletes to the authenticated owner", async () => {
    mocks.requireOwner.mockResolvedValue({ ownerId: "owner-one" });
    mocks.update.mockResolvedValue(true);
    mocks.delete.mockResolvedValue(true);

    await expect(
      updateCredentialAction(projectId, referenceId, {}, payload()),
    ).rejects.toThrow("NEXT_REDIRECT");
    expect(mocks.update).toHaveBeenCalledWith(
      "db",
      "owner-one",
      referenceId,
      expect.objectContaining({ projectId }),
    );

    await expect(deleteCredentialAction(projectId, referenceId)).rejects.toThrow(
      "NEXT_REDIRECT",
    );
    expect(mocks.delete).toHaveBeenCalledWith(
      "db",
      "owner-one",
      referenceId,
    );
  });
});

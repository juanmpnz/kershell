import { describe, expect, it } from "vitest";

import { createCredentialReferenceSchema } from "../credential-references";

const validReference = {
  projectId: "018f47a8-43dc-7c49-9800-bc8f5ca12aa3",
  name: "Production deploy token",
  service: "Coolify",
  environment: "PRODUCTION",
  credentialType: "DEPLOY_TOKEN",
  secretProvider: "ONEPASSWORD",
  externalItemId: "vault-item-01J9ABCDEF",
  lastRotatedAt: null,
  rotationIntervalDays: 90,
  notes: null,
};

describe("createCredentialReferenceSchema", () => {
  it("accepts metadata that points to an external secret", () => {
    expect(
      createCredentialReferenceSchema.safeParse(validReference).success,
    ).toBe(true);
  });

  it("rejects URLs and secret-bearing fields", () => {
    expect(
      createCredentialReferenceSchema.safeParse({
        ...validReference,
        externalItemId: "https://vault.example/item?token=secret",
      }).success,
    ).toBe(false);
    expect(
      createCredentialReferenceSchema.safeParse({
        ...validReference,
        token: "must-not-cross-the-boundary",
      }).success,
    ).toBe(false);
  });
});

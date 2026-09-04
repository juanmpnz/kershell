import { describe, expect, it } from "vitest";

import { parseCredentialFormData } from "@/lib/credentials/credential-form";

describe("credential reference form boundary", () => {
  it("keeps secret-bearing fields outside the parsed DTO", () => {
    const data = new FormData();
    data.set("name", "Production login");
    data.set("service", "Coolify");
    data.set("environment", "PRODUCTION");
    data.set("credentialType", "LOGIN");
    data.set("secretProvider", "ONEPASSWORD");
    data.set("externalItemId", "vault-item-001");
    data.set("rotationIntervalDays", "90");
    data.set("password", "must-not-cross");
    data.set("tokenValue", "must-not-cross");
    const result = parseCredentialFormData(
      data,
      "20000000-0000-4000-8000-000000000001",
    );
    expect(result.success).toBe(true);
    if (result.success) {
      expect(Object.keys(result.data)).not.toEqual(
        expect.arrayContaining(["password", "tokenValue", "secretValue"]),
      );
    }
  });

  it("rejects URLs in the opaque external identifier", () => {
    const data = new FormData();
    data.set("name", "Login");
    data.set("service", "Coolify");
    data.set("environment", "PRODUCTION");
    data.set("credentialType", "LOGIN");
    data.set("secretProvider", "OTHER");
    data.set("externalItemId", "https://vault/item");
    expect(
      parseCredentialFormData(
        data,
        "20000000-0000-4000-8000-000000000001",
      ).success,
    ).toBe(false);
  });
});

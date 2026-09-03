import { describe, expect, it } from "vitest";

import {
  authorizeGoogleIdentity,
  type GoogleIdentityPolicy,
} from "@/lib/auth/google-identity";

const policy: GoogleIdentityPolicy = {
  personalEmail: "personal-owner@example.invalid",
  workspaceDomain: "heykershell.com",
  workspaceEmail: "owner@heykershell.com",
};

const baseProfile = {
  sub: "google-subject-123",
  email: policy.workspaceEmail,
  email_verified: true,
  hd: policy.workspaceDomain,
};

describe("Google owner identity policy", () => {
  it("accepts the exact verified Workspace identity with matching hd", () => {
    expect(authorizeGoogleIdentity(baseProfile, policy)).toEqual({
      email: policy.workspaceEmail,
      hostedDomain: policy.workspaceDomain,
      providerSubject: baseProfile.sub,
    });
  });

  it("accepts the exact verified personal identity without hd", () => {
    expect(
      authorizeGoogleIdentity(
        {
          ...baseProfile,
          email: policy.personalEmail,
          hd: undefined,
        },
        policy,
      ),
    ).toEqual({
      email: policy.personalEmail,
      hostedDomain: null,
      providerSubject: baseProfile.sub,
    });
  });

  it.each([
    { ...baseProfile, email: "attacker@example.invalid" },
    { ...baseProfile, email_verified: false },
    { ...baseProfile, hd: "lookalike-heykershell.com" },
    { ...baseProfile, sub: "" },
    { ...baseProfile, email: policy.personalEmail },
  ])("rejects an unauthorized or incomplete profile", (profile) => {
    expect(authorizeGoogleIdentity(profile, policy)).toBeNull();
  });
});

import { describe, expect, it } from "vitest";

import { createAuthOptions, parseAuthEnvironment } from "@/lib/auth/config";

const validEnvironment = {
  ADMIN_ALLOWED_EMAILS:
    "owner@heykershell.com,personal-owner@example.invalid",
  ADMIN_OWNER_ID: "10000000-0000-4000-8000-000000000001",
  ADMIN_WORKSPACE_DOMAIN: "heykershell.com",
  BETTER_AUTH_SECRET: "x".repeat(32),
  BETTER_AUTH_TRUSTED_ORIGINS:
    "https://example.invalid,http://localhost:3001",
  BETTER_AUTH_URL: "https://example.invalid",
  DATABASE_URL: "postgres://app:placeholder@database.internal/kershell",
  GOOGLE_CLIENT_ID: "test-client-id.apps.googleusercontent.com",
  GOOGLE_CLIENT_SECRET: "test-only-client-secret",
};

describe("Better Auth environment", () => {
  it("normalizes an exact, explicit runtime configuration", () => {
    expect(parseAuthEnvironment(validEnvironment)).toEqual({
      allowedEmails: [
        "owner@heykershell.com",
        "personal-owner@example.invalid",
      ],
      ownerId: "10000000-0000-4000-8000-000000000001",
      baseUrl: "https://example.invalid",
      databaseUrl:
        "postgres://app:placeholder@database.internal/kershell",
      googleClientId: "test-client-id.apps.googleusercontent.com",
      googleClientSecret: "test-only-client-secret",
      secret: "x".repeat(32),
      trustedOrigins: [
        "https://example.invalid",
        "http://localhost:3001",
      ],
      workspaceDomain: "heykershell.com",
    });
  });

  it.each([
    { ...validEnvironment, BETTER_AUTH_SECRET: "too-short" },
    { ...validEnvironment, BETTER_AUTH_URL: "http://example.invalid" },
    {
      ...validEnvironment,
      BETTER_AUTH_TRUSTED_ORIGINS: "https://example.invalid/path",
    },
    {
      ...validEnvironment,
      BETTER_AUTH_TRUSTED_ORIGINS: "https://other.example.invalid",
    },
    {
      ...validEnvironment,
      ADMIN_ALLOWED_EMAILS: "owner@heykershell.com",
    },
    { ...validEnvironment, ADMIN_OWNER_ID: "not-a-uuid" },
  ])("rejects an unsafe or incomplete environment", (environment) => {
    expect(() => parseAuthEnvironment(environment)).toThrow(
      "Invalid admin authentication configuration.",
    );
  });
});

describe("Better Auth options", () => {
  it("enables only encrypted Google OAuth with database-backed state", () => {
    const options = createAuthOptions(parseAuthEnvironment(validEnvironment));

    expect(options.basePath).toBe("/admin/api/auth");
    expect(options.emailAndPassword).toEqual({ enabled: false });
    expect(options.trustedOrigins).toEqual([
      "https://example.invalid",
      "http://localhost:3001",
    ]);
    expect(options.socialProviders).toEqual({
      google: {
        clientId: "test-client-id.apps.googleusercontent.com",
        clientSecret: "test-only-client-secret",
        prompt: "select_account",
        requireEmailVerification: true,
      },
    });
    expect(options.account).toMatchObject({
      accountLinking: { enabled: false },
      encryptOAuthTokens: true,
      storeAccountCookie: false,
      storeStateStrategy: "database",
    });
  });
});

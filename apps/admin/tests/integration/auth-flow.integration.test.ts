import { getDatabase } from "@kershell/db/client";
import {
  adminIdentities,
  authAccounts,
  authSessions,
  authUsers,
  authVerifications,
} from "@kershell/db/schema";
import { seedFixture } from "@kershell/db/seed";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

import {
  createKershellAuth,
  type KershellAuth,
} from "@/lib/auth/auth";
import { parseAuthEnvironment } from "@/lib/auth/config";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required for auth integration tests.");
}

const environment = parseAuthEnvironment({
  ADMIN_ALLOWED_EMAILS:
    "owner@workspace.example.invalid,personal-owner@example.invalid",
  ADMIN_OWNER_ID: seedFixture.owner.id,
  ADMIN_WORKSPACE_DOMAIN: "workspace.example.invalid",
  BETTER_AUTH_SECRET: "integration-test-secret-value-only".repeat(2),
  BETTER_AUTH_TRUSTED_ORIGINS: "https://admin.example.invalid",
  BETTER_AUTH_URL: "https://admin.example.invalid",
  DATABASE_URL: databaseUrl,
  GOOGLE_CLIENT_ID: "integration-client-id.apps.googleusercontent.com",
  GOOGLE_CLIENT_SECRET: "integration-client-secret",
});

function readCookie(setCookie: string | null, suffix: string): string {
  const cookie = setCookie
    ?.split(/,(?=\s*(?:__Secure-)?better-auth\.)/)
    .map((value) => value.trim().split(";", 1)[0])
    .find((value) => value?.startsWith(`__Secure-better-auth.${suffix}=`));

  if (!cookie) {
    throw new Error(`Expected ${suffix} cookie.`);
  }

  return cookie;
}

async function completeGoogleCallback(auth: KershellAuth) {
  const startResponse = await auth.handler(
    new Request("https://admin.example.invalid/api/auth/sign-in/social", {
      body: JSON.stringify({
        callbackURL: "/dashboard",
        errorCallbackURL: "/login",
        provider: "google",
      }),
      headers: {
        "content-type": "application/json",
        origin: "https://admin.example.invalid",
      },
      method: "POST",
    }),
  );
  const startBody = await startResponse.json();
  const authorizationUrl = new URL(startBody.url);
  const stateCookie = readCookie(startResponse.headers.get("set-cookie"), "state");
  const state = authorizationUrl.searchParams.get("state");

  return auth.handler(
    new Request(
      `https://admin.example.invalid/api/auth/callback/google?code=stub-code&state=${encodeURIComponent(state ?? "")}`,
      { headers: { cookie: stateCookie } },
    ),
  );
}

describe("Better Auth Google flow", () => {
  const database = getDatabase();

  function createAuthorizedAuth() {
    return createKershellAuth(environment, database, {
      getUserInfo: async () => ({
        data: {
          aud: "integration-client-id.apps.googleusercontent.com",
          azp: "integration-client-id.apps.googleusercontent.com",
          email: "owner@workspace.example.invalid",
          email_verified: true,
          exp: 4_102_444_800,
          family_name: "Owner",
          given_name: "Kershell",
          hd: "workspace.example.invalid",
          iat: 1_700_000_000,
          iss: "https://accounts.google.com",
          name: "Kershell Owner",
          picture: "https://images.example.invalid/owner.png",
          sub: "google-subject-integration",
        },
        user: {
          email: "owner@workspace.example.invalid",
          emailVerified: true,
          name: "Kershell Owner",
        },
      }),
    });
  }

  beforeEach(async () => {
    await database.delete(authVerifications);
    await database.delete(authUsers);
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: string | URL | Request) => {
        const url =
          input instanceof Request ? input.url : input.toString();

        if (url === "https://oauth2.googleapis.com/token") {
          return Response.json({
            access_token: "provider-access-value",
            expires_in: 3_600,
            id_token: "provider-id-value",
            scope: "openid email profile",
            token_type: "Bearer",
          });
        }

        throw new Error(`Unexpected provider request: ${url}`);
      }),
    );
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  it("creates and revokes a PostgreSQL session through a stubbed callback", async () => {
    const auth = createKershellAuth(environment, database, {
      getUserInfo: async () => ({
        data: {
          aud: "integration-client-id.apps.googleusercontent.com",
          azp: "integration-client-id.apps.googleusercontent.com",
          email: "owner@workspace.example.invalid",
          email_verified: true,
          exp: 4_102_444_800,
          family_name: "Owner",
          given_name: "Kershell",
          hd: "workspace.example.invalid",
          iat: 1_700_000_000,
          iss: "https://accounts.google.com",
          name: "Kershell Owner",
          picture: "https://images.example.invalid/owner.png",
          sub: "google-subject-integration",
        },
        user: {
          email: "owner@workspace.example.invalid",
          emailVerified: true,
          name: "Kershell Owner",
        },
      }),
    });
    const startResponse = await auth.handler(
      new Request("https://admin.example.invalid/api/auth/sign-in/social", {
        body: JSON.stringify({
          callbackURL: "/dashboard",
          provider: "google",
        }),
        headers: {
          "content-type": "application/json",
          origin: "https://admin.example.invalid",
        },
        method: "POST",
      }),
    );
    const startBody = await startResponse.json();
    const authorizationUrl = new URL(startBody.url);
    const stateCookie = readCookie(startResponse.headers.get("set-cookie"), "state");
    const state = authorizationUrl.searchParams.get("state");

    expect(startResponse.status).toBe(200);
    expect(authorizationUrl.origin).toBe("https://accounts.google.com");
    expect(state).toBeTruthy();

    const callbackResponse = await auth.handler(
      new Request(
        `https://admin.example.invalid/api/auth/callback/google?code=stub-code&state=${encodeURIComponent(state ?? "")}`,
        { headers: { cookie: stateCookie } },
      ),
    );
    const sessionCookie = readCookie(
      callbackResponse.headers.get("set-cookie"),
      "session_token",
    );

    expect(callbackResponse.status).toBe(302);
    expect(callbackResponse.headers.get("location")).toBe("/dashboard");

    const sessionResponse = await auth.handler(
      new Request("https://admin.example.invalid/api/auth/get-session", {
        headers: { cookie: sessionCookie },
      }),
    );
    const sessionBody = await sessionResponse.json();
    const [storedAccount] = await database.select().from(authAccounts);
    const [storedIdentity] = await database.select().from(adminIdentities);

    expect(sessionBody.user.email).toBe(
      "owner@workspace.example.invalid",
    );
    expect(storedAccount.accessToken).not.toBe("provider-access-value");
    expect(storedAccount.idToken).toBeNull();
    expect(storedIdentity).toMatchObject({
      authUserId: sessionBody.user.id,
      email: "owner@workspace.example.invalid",
      hostedDomain: "workspace.example.invalid",
      ownerId: seedFixture.owner.id,
      providerSubject: "google-subject-integration",
      status: "ACTIVE",
    });

    await database.delete(authSessions);

    const revokedResponse = await auth.handler(
      new Request("https://admin.example.invalid/api/auth/get-session", {
        headers: { cookie: sessionCookie },
      }),
    );

    expect(await revokedResponse.json()).toBeNull();
  });

  it("rejects a Google profile outside the exact owner allowlist", async () => {
    const auth = createKershellAuth(environment, database, {
      getUserInfo: async () => ({
        data: {
          aud: "integration-client-id.apps.googleusercontent.com",
          azp: "integration-client-id.apps.googleusercontent.com",
          email: "attacker@example.invalid",
          email_verified: true,
          exp: 4_102_444_800,
          family_name: "User",
          given_name: "Unknown",
          iat: 1_700_000_000,
          iss: "https://accounts.google.com",
          name: "Unknown User",
          picture: "https://images.example.invalid/unknown.png",
          sub: "unauthorized-google-subject",
        },
        user: {
          email: "attacker@example.invalid",
          emailVerified: true,
          name: "Unknown User",
        },
      }),
    });
    const startResponse = await auth.handler(
      new Request("https://admin.example.invalid/api/auth/sign-in/social", {
        body: JSON.stringify({
          callbackURL: "/dashboard",
          errorCallbackURL: "/login",
          provider: "google",
        }),
        headers: {
          "content-type": "application/json",
          origin: "https://admin.example.invalid",
        },
        method: "POST",
      }),
    );
    const startBody = await startResponse.json();
    const authorizationUrl = new URL(startBody.url);
    const stateCookie = readCookie(
      startResponse.headers.get("set-cookie"),
      "state",
    );
    const state = authorizationUrl.searchParams.get("state");
    const callbackResponse = await auth.handler(
      new Request(
        `https://admin.example.invalid/api/auth/callback/google?code=stub-code&state=${encodeURIComponent(state ?? "")}`,
        { headers: { cookie: stateCookie } },
      ),
    );

    expect(callbackResponse.status).toBe(302);
    expect(callbackResponse.headers.get("location")).toContain(
      "/login?error=",
    );
    expect(await database.select().from(authUsers)).toHaveLength(0);
    expect(await database.select().from(authSessions)).toHaveLength(0);
  });

  it("does not issue another session after the local identity is revoked", async () => {
    const auth = createAuthorizedAuth();
    const firstCallback = await completeGoogleCallback(auth);

    expect(
      readCookie(firstCallback.headers.get("set-cookie"), "session_token"),
    ).toContain("better-auth.session_token=");

    await database.update(adminIdentities).set({ status: "DISABLED" });
    await database.delete(authSessions);

    const revokedCallback = await completeGoogleCallback(auth);

    expect(revokedCallback.status).toBe(302);
    expect(revokedCallback.headers.get("location")).toContain(
      "/login?error=",
    );
    expect(await database.select().from(authSessions)).toHaveLength(0);
  });
});

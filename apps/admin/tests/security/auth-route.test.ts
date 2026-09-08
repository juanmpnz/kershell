import { betterAuth } from "better-auth";
import { memoryAdapter } from "better-auth/adapters/memory";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { GET, POST } from "@/app/api/auth/[...all]/route";
import { createAuthOptions } from "@/lib/auth/config";

const mocks = vi.hoisted(() => ({ getAuth: vi.fn() }));

vi.mock("@/lib/auth/auth", () => ({ getAuth: mocks.getAuth }));

function signInRequest(prefix: string, origin = "https://example.invalid") {
  return new Request(`https://example.invalid${prefix}/api/auth/sign-in/social`, {
    method: "POST",
    headers: { "content-type": "application/json", origin },
    body: JSON.stringify({
      provider: "google",
      callbackURL: "/admin/dashboard",
      errorCallbackURL: "/admin/login",
    }),
  });
}

describe("admin auth route with a Next.js basePath", () => {
  beforeEach(() => {
    vi.stubEnv("ADMIN_ENABLED", "true");
    mocks.getAuth.mockReset();
    const options = createAuthOptions({
      allowedEmails: [
        "owner@workspace.example.invalid",
        "personal@example.invalid",
      ],
      baseUrl: "https://example.invalid",
      databaseUrl: "postgres://unused:placeholder@database.invalid/test",
      googleClientId: "test-client-id.apps.googleusercontent.com",
      googleClientSecret: "test-only-client-secret",
      ownerId: "10000000-0000-4000-8000-000000000001",
      secret: "test-only-auth-secret".repeat(3),
      trustedOrigins: ["https://example.invalid"],
      workspaceDomain: "workspace.example.invalid",
    });
    mocks.getAuth.mockReturnValue(
      betterAuth({
        ...options,
        // Better Auth disables origin checks by default in NODE_ENV=test.
        advanced: { ...options.advanced, disableOriginCheck: false },
        database: memoryAdapter({
          user: [], session: [], account: [], verification: [],
        }),
        logger: { disabled: true },
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it.each(["", "/admin"])(
    "serves get-session with incoming prefix '%s'",
    async (prefix) => {
      const response = await GET(
        new Request(`https://example.invalid${prefix}/api/auth/get-session`),
      );

      expect(response.status).toBe(200);
      expect(await response.json()).toBeNull();
    },
  );

  it.each(["", "/admin"])(
    "starts Google OAuth with incoming prefix '%s'",
    async (prefix) => {
      const response = await POST(signInRequest(prefix));

      expect(response.status).toBe(200);
      const authorizationUrl = new URL((await response.json()).url);
      expect(authorizationUrl.origin).toBe("https://accounts.google.com");
      expect(authorizationUrl.searchParams.get("redirect_uri")).toBe(
        "https://example.invalid/admin/api/auth/callback/google",
      );
      expect(authorizationUrl.searchParams.get("state")).toBeTruthy();
      expect(response.headers.get("set-cookie")).toContain("better-auth.state=");
    },
  );

  it("preserves callback query parameters and the OAuth state cookie", async () => {
    const start = await POST(signInRequest(""));
    const authorizationUrl = new URL((await start.json()).url);
    const query = new URLSearchParams({
      error: "access_denied",
      error_description: "Test user declined access",
      state: authorizationUrl.searchParams.get("state") ?? "",
    });
    const cookie = start.headers.getSetCookie()
      .map((value) => value.split(";", 1)[0])
      .join("; ");

    const response = await GET(new Request(
      `https://example.invalid/api/auth/callback/google?${query}`,
      { headers: { cookie } },
    ));

    expect(response.status).toBe(302);
    const location = new URL(response.headers.get("location") ?? "", "https://example.invalid");
    expect(location.pathname).toBe("/admin/login");
    expect(location.searchParams.get("error")).toBe("access_denied");
    expect(location.searchParams.get("error_description")).toBe("Test user declined access");
  });

  it("still rejects an untrusted POST origin with cookies", async () => {
    const request = signInRequest("", "https://untrusted.example.invalid");
    request.headers.set("cookie", "test-only-cookie=placeholder");
    const response = await POST(request);

    expect(response.status).toBe(403);
  });

  it.each(["/api/authentication/get-session", "/admin/admin/api/auth/get-session"])(
    "does not turn the unrelated path %s into an auth endpoint",
    async (path) => {
      const response = await GET(new Request(`https://example.invalid${path}`));

      expect(response.status).toBe(404);
    },
  );

  it.each(["GET", "POST"])(
    "keeps %s disabled without initializing auth",
    async (method) => {
      vi.stubEnv("ADMIN_ENABLED", "false");
      const response = method === "POST"
        ? await POST(signInRequest(""))
        : await GET(new Request("https://example.invalid/api/auth/get-session"));

      expect(response.status).toBe(404);
      expect(await response.json()).toEqual({ error: "Not found." });
      expect(mocks.getAuth).not.toHaveBeenCalled();
    },
  );
});

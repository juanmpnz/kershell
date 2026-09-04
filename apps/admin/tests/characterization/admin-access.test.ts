import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { GET as betterAuthGet } from "@/app/api/auth/[...all]/route";
import { isAdminEnabled } from "@/lib/admin-availability";
import proxy from "@/proxy";

describe("current admin access boundary", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("redirects an unauthenticated dashboard request to login", async () => {
    vi.stubEnv("ADMIN_ENABLED", "true");
    const request = new NextRequest("https://example.invalid/admin/dashboard");

    const response = await proxy(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://example.invalid/admin/login",
    );
  });

  it("returns not found for UI routes unless explicitly enabled", async () => {
    vi.stubEnv("ADMIN_ENABLED", "false");

    const response = await proxy(
      new NextRequest("https://example.invalid/admin/dashboard"),
    );

    expect(response.status).toBe(404);
  });

  it.each([undefined, "false", "TRUE", " true "])(
    "rejects non-canonical feature flag value %s",
    (value) => {
      expect(isAdminEnabled(value)).toBe(false);
      expect(isAdminEnabled("true")).toBe(true);
    },
  );

  it("returns not found for auth APIs unless explicitly enabled", async () => {
    vi.stubEnv("ADMIN_ENABLED", "false");

    const betterAuthResponse = await betterAuthGet(
      new Request("https://example.invalid/admin/api/auth/get-session"),
    );

    expect(betterAuthResponse.status).toBe(404);
  });
});

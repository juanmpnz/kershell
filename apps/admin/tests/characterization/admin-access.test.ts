import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { POST as login } from "@/app/api/admin/login/route";
import { POST as logout } from "@/app/api/admin/logout/route";
import { isAdminEnabled } from "@/lib/admin-availability";
import proxy from "@/proxy";

describe("current admin access boundary", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("redirects an unauthenticated dashboard request to login", async () => {
    vi.stubEnv("ADMIN_ENABLED", "true");
    const request = new NextRequest("https://admin.example/dashboard");

    const response = await proxy(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://admin.example/login");
  });

  it("returns not found for UI routes unless explicitly enabled", async () => {
    vi.stubEnv("ADMIN_ENABLED", "false");

    const response = await proxy(
      new NextRequest("https://admin.example/dashboard"),
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

    const loginResponse = await login(
      new Request("https://admin.example/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({}),
      }),
    );
    const logoutResponse = logout();

    expect(loginResponse.status).toBe(404);
    expect(logoutResponse.status).toBe(404);
  });
});

import { describe, expect, it } from "vitest";

import { createSecurityHeaders } from "@kershell/config/security-headers";

function headerRecord(isProduction: boolean) {
  return Object.fromEntries(
    createSecurityHeaders(isProduction).map(({ key, value }) => [key, value]),
  );
}

describe("admin security response headers", () => {
  it("blocks framing and enables transport hardening in production", () => {
    const headers = headerRecord(true);

    expect(headers["Content-Security-Policy"]).toContain("frame-ancestors 'none'");
    expect(headers["X-Frame-Options"]).toBe("DENY");
    expect(headers["Strict-Transport-Security"]).toContain("max-age=");
  });
});

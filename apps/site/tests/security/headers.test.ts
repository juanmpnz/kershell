import { describe, expect, it } from "vitest";

import { createSecurityHeaders } from "@/lib/security/headers";

function headerRecord(isProduction: boolean) {
  return Object.fromEntries(
    createSecurityHeaders(isProduction).map(({ key, value }) => [key, value]),
  );
}

describe("security response headers", () => {
  it("enforces a self-hosted CSP and browser hardening", () => {
    const headers = headerRecord(true);

    expect(headers["Content-Security-Policy"]).toContain("default-src 'self'");
    expect(headers["Content-Security-Policy"]).toContain("frame-ancestors 'none'");
    expect(headers["Content-Security-Policy"]).toContain("object-src 'none'");
    expect(headers["Content-Security-Policy"]).toContain("upgrade-insecure-requests");
    expect(headers["X-Content-Type-Options"]).toBe("nosniff");
    expect(headers["X-Frame-Options"]).toBe("DENY");
    expect(headers["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
  });

  it("only enables HSTS and forced HTTPS in production", () => {
    const production = headerRecord(true);
    const development = headerRecord(false);

    expect(production["Strict-Transport-Security"]).toContain("max-age=");
    expect(development["Strict-Transport-Security"]).toBeUndefined();
    expect(development["Content-Security-Policy"]).not.toContain(
      "upgrade-insecure-requests",
    );
    expect(development["Content-Security-Policy"]).toContain("'unsafe-eval'");
  });
});

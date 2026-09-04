import { describe, expect, it } from "vitest";

import { isReservedAdminPath } from "@/lib/routing/is-reserved-admin-path";

describe("public site admin boundary", () => {
  it.each(["/admin", "/admin/login", "/admin/_next/static/app.js"])(
    "fails closed when the admin route falls through to the site: %s",
    (pathname) => {
      expect(isReservedAdminPath(pathname)).toBe(true);
    },
  );

  it.each(["/", "/en", "/administrator"])(
    "leaves public routes untouched: %s",
    (pathname) => {
      expect(isReservedAdminPath(pathname)).toBe(false);
    },
  );
});

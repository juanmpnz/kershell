import { describe, expect, it } from "vitest";

import {
  ADMIN_AUTH_BASE_PATH,
  ADMIN_BASE_PATH,
  ADMIN_DASHBOARD_PATH,
  ADMIN_LOGIN_PATH,
  ADMIN_OAUTH_ERROR_PATH,
  withoutAdminBasePath,
} from "@/lib/routing/admin-paths";

describe("admin paths", () => {
  it("mounts every public admin URL below the canonical base path", () => {
    expect(ADMIN_BASE_PATH).toBe("/admin");
    expect(ADMIN_AUTH_BASE_PATH).toBe("/admin/api/auth");
    expect(ADMIN_LOGIN_PATH).toBe("/admin/login");
    expect(ADMIN_DASHBOARD_PATH).toBe("/admin/dashboard");
    expect(ADMIN_OAUTH_ERROR_PATH).toBe("/admin/login?error=oauth");
  });

  it("normalizes browser pathnames for internal route comparisons", () => {
    expect(withoutAdminBasePath("/admin/dashboard/vault")).toBe(
      "/dashboard/vault",
    );
    expect(withoutAdminBasePath("/dashboard/vault")).toBe(
      "/dashboard/vault",
    );
  });

});

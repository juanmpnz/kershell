export const ADMIN_BASE_PATH = "/admin" as const;
export const ADMIN_AUTH_BASE_PATH = `${ADMIN_BASE_PATH}/api/auth` as const;
export const ADMIN_LOGIN_PATH = `${ADMIN_BASE_PATH}/login` as const;
export const ADMIN_DASHBOARD_PATH = `${ADMIN_BASE_PATH}/dashboard` as const;
export const ADMIN_OAUTH_ERROR_PATH = `${ADMIN_LOGIN_PATH}?error=oauth` as const;

export function withoutAdminBasePath(pathname: string): string {
  if (pathname === ADMIN_BASE_PATH) {
    return "/";
  }

  return pathname.startsWith(`${ADMIN_BASE_PATH}/`)
    ? pathname.slice(ADMIN_BASE_PATH.length)
    : pathname;
}

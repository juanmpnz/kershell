import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";
import { isAdminEnabled } from "./lib/admin-availability";
import {
  ADMIN_DASHBOARD_PATH,
  ADMIN_LOGIN_PATH,
  withoutAdminBasePath,
} from "./lib/routing/admin-paths";

export default async function proxy(request: NextRequest) {
  if (!isAdminEnabled()) {
    return new NextResponse(null, { status: 404 });
  }

  const pathname = withoutAdminBasePath(request.nextUrl.pathname);
  const isLoginRoute = pathname === "/login";
  const session = getSessionCookie(request);

  if (!session && !isLoginRoute) {
    return NextResponse.redirect(new URL(ADMIN_LOGIN_PATH, request.url));
  }

  if (session && isLoginRoute) {
    return NextResponse.redirect(new URL(ADMIN_DASHBOARD_PATH, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};

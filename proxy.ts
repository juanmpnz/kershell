import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { ADMIN_SESSION_COOKIE, verifyAdminSession } from "./lib/admin-session";

const intlMiddleware = createMiddleware(routing);

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/login" || pathname.startsWith("/admin") || pathname.startsWith("/dashboard")) {
    const isLoginRoute = pathname === "/admin/login";
    const isPublicLoginRoute = pathname === "/login";
    const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    const session = await verifyAdminSession(token).catch(() => null);

    if (!session && !isLoginRoute && !isPublicLoginRoute) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (session && (isLoginRoute || isPublicLoginRoute)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};

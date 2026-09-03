import { NextResponse, type NextRequest } from "next/server";
import { isAdminEnabled } from "./lib/admin-availability";
import { ADMIN_SESSION_COOKIE, verifyAdminSession } from "./lib/admin-session";

export default async function proxy(request: NextRequest) {
  if (!isAdminEnabled()) {
    return new NextResponse(null, { status: 404 });
  }

  const { pathname } = request.nextUrl;
  const isLoginRoute = pathname === "/admin/login" || pathname === "/login";
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const session = await verifyAdminSession(token).catch(() => null);

  if (!session && !isLoginRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (session && isLoginRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};

import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";
import { isAdminEnabled } from "./lib/admin-availability";

export default async function proxy(request: NextRequest) {
  if (!isAdminEnabled()) {
    return new NextResponse(null, { status: 404 });
  }

  const { pathname } = request.nextUrl;
  const isLoginRoute = pathname === "/admin/login" || pathname === "/login";
  const session = getSessionCookie(request);

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

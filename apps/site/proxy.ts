import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";

import { routing } from "./i18n/routing";
import { isReservedAdminPath } from "./lib/routing/is-reserved-admin-path";

const handleLocalizedRoute = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  if (isReservedAdminPath(request.nextUrl.pathname)) {
    return new NextResponse(null, { status: 404 });
  }

  return handleLocalizedRoute(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};

import { toNextJsHandler } from "better-auth/next-js";

import { isAdminEnabled } from "@/lib/admin-availability";
import { getAuth } from "@/lib/auth/auth";
import { ADMIN_BASE_PATH } from "@/lib/routing/admin-paths";

function withPublicAuthUrl(request: Request): Request {
  const url = new URL(request.url);

  if (!url.pathname.startsWith("/api/auth/")) {
    return request;
  }

  // Next.js strips its basePath before invoking Route Handlers, but Better Auth
  // matches against the public /admin/api/auth path used by OAuth callbacks.
  url.pathname = `${ADMIN_BASE_PATH}${url.pathname}`;
  return new Request(url, request);
}

function notFound() {
  return Response.json({ error: "Not found." }, { status: 404 });
}

export async function GET(request: Request) {
  if (!isAdminEnabled()) {
    return notFound();
  }

  return toNextJsHandler(getAuth()).GET(withPublicAuthUrl(request));
}

export async function POST(request: Request) {
  if (!isAdminEnabled()) {
    return notFound();
  }

  return toNextJsHandler(getAuth()).POST(withPublicAuthUrl(request));
}

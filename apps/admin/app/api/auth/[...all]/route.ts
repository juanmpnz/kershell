import { toNextJsHandler } from "better-auth/next-js";

import { isAdminEnabled } from "@/lib/admin-availability";
import { getAuth } from "@/lib/auth/auth";

function notFound() {
  return Response.json({ error: "Not found." }, { status: 404 });
}

export async function GET(request: Request) {
  if (!isAdminEnabled()) {
    return notFound();
  }

  return toNextJsHandler(getAuth()).GET(request);
}

export async function POST(request: Request) {
  if (!isAdminEnabled()) {
    return notFound();
  }

  return toNextJsHandler(getAuth()).POST(request);
}

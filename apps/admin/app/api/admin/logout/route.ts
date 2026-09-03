import { NextResponse } from "next/server";
import { isAdminEnabled } from "@/lib/admin-availability";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin-session";

export function POST() {
  if (!isAdminEnabled()) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const response = NextResponse.json({ ok: true });

  response.cookies.set(ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/",
  });

  return response;
}

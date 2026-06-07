import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, signAdminSession } from "@/lib/admin-session";

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function safeEquals(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

function getConfiguredPasswordHash() {
  if (process.env.ADMIN_PASSWORD_SHA256) {
    return process.env.ADMIN_PASSWORD_SHA256;
  }

  if (process.env.ADMIN_PASSWORD) {
    return sha256(process.env.ADMIN_PASSWORD);
  }

  throw new Error("ADMIN_PASSWORD_SHA256 or ADMIN_PASSWORD must be configured.");
}

export async function POST(request: Request) {
  const { email, password } = (await request.json()) as {
    email?: string;
    password?: string;
  };
  const configuredEmail = process.env.ADMIN_EMAIL;

  if (!configuredEmail || !email || !password) {
    return NextResponse.json({ error: "Credenciales inválidas." }, { status: 401 });
  }

  const emailMatches = safeEquals(email.toLowerCase(), configuredEmail.toLowerCase());
  const passwordMatches = safeEquals(sha256(password), getConfiguredPasswordHash());

  if (!emailMatches || !passwordMatches) {
    return NextResponse.json({ error: "Credenciales inválidas." }, { status: 401 });
  }

  const token = await signAdminSession(configuredEmail);
  const response = NextResponse.json({ ok: true });

  response.cookies.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 12,
    path: "/",
  });

  return response;
}

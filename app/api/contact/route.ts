import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

// TODO: confirmar dominio en Resend; usar CONTACT_EMAIL env si hello@kershell.dev cambia.
const CONTACT_EMAIL = process.env.CONTACT_EMAIL || "hello@kershell.dev";
const CONTACT_FROM_EMAIL =
  process.env.CONTACT_FROM_EMAIL || "Kershell Contact <onboarding@resend.dev>";
const MAX_CONTENT_LENGTH = 12_000;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;
const rateLimit = new Map<string, { count: number; resetAt: number }>();

type ContactPayload = {
  name?: unknown;
  email?: unknown;
  company?: unknown;
  project_type?: unknown;
  message?: unknown;
  website?: unknown;
};

function cleanText(value: unknown, maxLength: number) {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .trim()
    .slice(0, maxLength);
}

function cleanMessage(value: unknown, maxLength: number) {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .replace(/\r\n/g, "\n")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim()
    .slice(0, maxLength);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getClientIp(req: NextRequest) {
  const forwardedFor = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwardedFor || req.headers.get("x-real-ip") || "unknown";
}

function isRateLimited(ip: string) {
  const now = Date.now();
  const current = rateLimit.get(ip);

  if (!current || current.resetAt < now) {
    rateLimit.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  current.count += 1;
  return current.count > RATE_LIMIT_MAX_REQUESTS;
}

function isAllowedOrigin(req: NextRequest) {
  const origin = req.headers.get("origin");
  if (!origin) {
    return true;
  }

  try {
    return new URL(origin).host === req.nextUrl.host;
  } catch {
    return false;
  }
}

function errorResponse(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

export async function POST(req: NextRequest) {
  try {
    if (!isAllowedOrigin(req)) {
      return errorResponse("Request origin is not allowed", 403);
    }

    const contentLength = Number(req.headers.get("content-length") || "0");
    if (contentLength > MAX_CONTENT_LENGTH) {
      return errorResponse("Message is too large", 413);
    }

    const ip = getClientIp(req);
    if (isRateLimited(ip)) {
      return errorResponse("Too many requests. Please try again later.", 429);
    }

    const rawBody = await req.text();
    if (rawBody.length > MAX_CONTENT_LENGTH) {
      return errorResponse("Message is too large", 413);
    }

    let body: ContactPayload;
    try {
      body = JSON.parse(rawBody) as ContactPayload;
    } catch {
      return errorResponse("Invalid request body", 400);
    }

    if (cleanText(body.website, 200)) {
      return NextResponse.json({ success: true });
    }

    const name = cleanText(body.name, 120);
    const email = cleanText(body.email, 254).toLowerCase();
    const company = cleanText(body.company, 140);
    const projectType = cleanText(body.project_type, 120);
    const message = cleanMessage(body.message, 3_000);

    if (!name || !email || !message) {
      return errorResponse("Name, email, and message are required", 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return errorResponse("Invalid email address", 400);
    }

    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not configured for contact form delivery.");
      return errorResponse("Email delivery is not configured", 500);
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeCompany = escapeHtml(company);
    const safeProjectType = escapeHtml(projectType);
    const safeMessage = escapeHtml(message).replace(/\n/g, "<br />");
    const subjectCompany = company ? ` (${company})` : "";

    await resend.emails.send({
      from: CONTACT_FROM_EMAIL,
      to: CONTACT_EMAIL,
      replyTo: email,
      subject: `New Project Inquiry from ${name}${subjectCompany}`,
      text: [
        "New Contact Form Submission",
        "",
        `Name: ${name}`,
        `Email: ${email}`,
        company ? `Company: ${company}` : "",
        projectType ? `Project Type: ${projectType}` : "",
        "",
        "Message:",
        message,
      ]
        .filter(Boolean)
        .join("\n"),
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${safeName}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        ${company ? `<p><strong>Company:</strong> ${safeCompany}</p>` : ""}
        ${projectType ? `<p><strong>Project Type:</strong> ${safeProjectType}</p>` : ""}
        <hr />
        <p><strong>Message:</strong></p>
        <p>${safeMessage}</p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to send message. Please try again." },
      { status: 500 }
    );
  }
}

const encoder = new TextEncoder();

export const ADMIN_SESSION_COOKIE = "kershell_admin_session";

type AdminSessionPayload = {
  email: string;
  exp: number;
};

function getSessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("ADMIN_SESSION_SECRET must be set and at least 32 characters long.");
  }

  return secret;
}

function base64UrlEncode(value: string | ArrayBuffer) {
  const bytes =
    typeof value === "string"
      ? encoder.encode(value)
      : new Uint8Array(value);

  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function base64UrlDecode(value: string) {
  const base64 = value.replaceAll("-", "+").replaceAll("_", "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));

  return new TextDecoder().decode(bytes);
}

async function importHmacKey(secret: string) {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export async function signAdminSession(email: string) {
  const payload: AdminSessionPayload = {
    email,
    exp: Date.now() + 1000 * 60 * 60 * 12,
  };
  const body = base64UrlEncode(JSON.stringify(payload));
  const key = await importHmacKey(getSessionSecret());
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(body));

  return `${body}.${base64UrlEncode(signature)}`;
}

export async function verifyAdminSession(token?: string) {
  if (!token) {
    return null;
  }

  const [body, signature] = token.split(".");

  if (!body || !signature) {
    return null;
  }

  const key = await importHmacKey(getSessionSecret());
  const expectedSignature = signature.replaceAll("-", "+").replaceAll("_", "/");
  const expectedBinary = atob(expectedSignature.padEnd(Math.ceil(expectedSignature.length / 4) * 4, "="));
  const expectedBytes = Uint8Array.from(expectedBinary, (char) => char.charCodeAt(0));
  const verified = await crypto.subtle.verify("HMAC", key, expectedBytes, encoder.encode(body));

  if (!verified) {
    return null;
  }

  const payload = JSON.parse(base64UrlDecode(body)) as AdminSessionPayload;

  if (!payload.email || payload.exp < Date.now()) {
    return null;
  }

  return payload;
}

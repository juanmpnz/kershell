import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, verifyAdminSession } from "@/lib/admin-session";

type AdminState = {
  subscriptions: unknown[];
  projects: unknown[];
  vaultSalt: string | null;
  vaultCheck: unknown | null;
};

const emptyState: AdminState = {
  subscriptions: [],
  projects: [],
  vaultSalt: null,
  vaultCheck: null,
};

function readCookie(request: Request, name: string) {
  const cookie = request.headers.get("cookie");

  if (!cookie) {
    return undefined;
  }

  return cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    return null;
  }

  return {
    endpoint: `${url.replace(/\/$/, "")}/rest/v1/admin_records`,
    serviceRoleKey,
  };
}

async function requireSession(request: Request) {
  const session = await verifyAdminSession(readCookie(request, ADMIN_SESSION_COOKIE));

  if (!session) {
    return null;
  }

  return session;
}

export async function GET(request: Request) {
  const session = await requireSession(request);

  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const supabase = getSupabaseConfig();

  if (!supabase) {
    return NextResponse.json({ error: "SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY no están configuradas." }, { status: 503 });
  }

  const response = await fetch(`${supabase.endpoint}?owner_email=eq.${encodeURIComponent(session.email)}&select=state&limit=1`, {
    headers: {
      apikey: supabase.serviceRoleKey,
      Authorization: `Bearer ${supabase.serviceRoleKey}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return NextResponse.json({ error: "No se pudo leer el estado administrativo." }, { status: 500 });
  }

  const rows = (await response.json()) as { state?: AdminState }[];
  return NextResponse.json(rows[0]?.state ?? emptyState);
}

export async function PUT(request: Request) {
  const session = await requireSession(request);

  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const supabase = getSupabaseConfig();

  if (!supabase) {
    return NextResponse.json({ error: "SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY no están configuradas." }, { status: 503 });
  }

  const state = (await request.json()) as AdminState;
  const response = await fetch(`${supabase.endpoint}?on_conflict=owner_email`, {
    method: "POST",
    headers: {
      apikey: supabase.serviceRoleKey,
      Authorization: `Bearer ${supabase.serviceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify({
      owner_email: session.email,
      state,
      updated_at: new Date().toISOString(),
    }),
  });

  if (!response.ok) {
    return NextResponse.json({ error: "No se pudo guardar el estado administrativo." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

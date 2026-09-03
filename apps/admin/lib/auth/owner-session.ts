import "server-only";

import { getDatabase, type KershellDatabase } from "@kershell/db/client";
import { getAuthorizedOwner } from "@kershell/db/repositories/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getAuth, type KershellAuth } from "./auth";

export type OwnerSession = {
  authUserId: string;
  name: string;
  ownerId: string;
};

export async function resolveOwnerSession(
  auth: KershellAuth,
  database: KershellDatabase,
  requestHeaders: Headers,
): Promise<OwnerSession | null> {
  const session = await auth.api.getSession({ headers: requestHeaders });

  if (!session) {
    return null;
  }

  const owner = await getAuthorizedOwner(database, session.user.id);

  if (!owner) {
    return null;
  }

  return {
    authUserId: session.user.id,
    name: session.user.name,
    ownerId: owner.ownerId,
  };
}

export async function getOwnerSession(): Promise<OwnerSession | null> {
  return resolveOwnerSession(getAuth(), getDatabase(), await headers());
}

export async function requireOwner(): Promise<OwnerSession> {
  const ownerSession = await getOwnerSession();

  if (!ownerSession) {
    redirect("/login");
  }

  return ownerSession;
}

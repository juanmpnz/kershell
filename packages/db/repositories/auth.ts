import "server-only";

import { and, eq, or } from "drizzle-orm";

import type { KershellDatabase } from "../client";
import {
  adminIdentities,
  authAccounts,
  authUsers,
  owners,
} from "../schema";

export type OwnerAdmission = {
  ownerId: string;
};

export type OwnerAdmissionInput = {
  allowedEmails: string[];
  authUserId: string;
  ownerId: string;
  workspaceDomain: string;
};

export async function getAuthorizedOwner(
  database: KershellDatabase,
  authUserId: string,
): Promise<OwnerAdmission | null> {
  const matches = await database
    .select({ ownerId: owners.id })
    .from(adminIdentities)
    .innerJoin(owners, eq(owners.id, adminIdentities.ownerId))
    .where(
      and(
        eq(adminIdentities.authUserId, authUserId),
        eq(adminIdentities.status, "ACTIVE"),
        eq(owners.status, "ACTIVE"),
      ),
    )
    .limit(2);

  return matches.length === 1 ? matches[0] : null;
}

export async function authorizeAndProvisionOwner(
  database: KershellDatabase,
  input: OwnerAdmissionInput,
): Promise<OwnerAdmission | null> {
  const allowedEmails = new Set(
    input.allowedEmails.map((email) => email.trim().toLowerCase()),
  );
  const workspaceDomain = input.workspaceDomain.trim().toLowerCase();

  return database.transaction(async (transaction) => {
    const accounts = await transaction
      .select({
        authUserId: authUsers.id,
        email: authUsers.email,
        emailVerified: authUsers.emailVerified,
        providerSubject: authAccounts.accountId,
      })
      .from(authUsers)
      .innerJoin(authAccounts, eq(authAccounts.userId, authUsers.id))
      .where(
        and(
          eq(authUsers.id, input.authUserId),
          eq(authAccounts.providerId, "google"),
          eq(authAccounts.issuer, "https://accounts.google.com"),
        ),
      )
      .limit(2);
    const [account] = accounts;

    if (
      accounts.length !== 1 ||
      !account?.emailVerified ||
      !allowedEmails.has(account.email)
    ) {
      return null;
    }

    const hostedDomain = account.email.endsWith(`@${workspaceDomain}`)
      ? workspaceDomain
      : null;
    const collisions = await transaction
      .select({
        authUserId: adminIdentities.authUserId,
        email: adminIdentities.email,
        hostedDomain: adminIdentities.hostedDomain,
        ownerId: adminIdentities.ownerId,
        providerSubject: adminIdentities.providerSubject,
        status: adminIdentities.status,
      })
      .from(adminIdentities)
      .where(
        or(
          eq(adminIdentities.authUserId, account.authUserId),
          eq(adminIdentities.email, account.email),
          eq(adminIdentities.providerSubject, account.providerSubject),
        ),
      )
      .limit(2);
    const [identity] = collisions;

    if (identity) {
      if (
        collisions.length !== 1 ||
        identity.authUserId !== account.authUserId ||
        identity.email !== account.email ||
        identity.hostedDomain !== hostedDomain ||
        identity.providerSubject !== account.providerSubject ||
        identity.status !== "ACTIVE"
      ) {
        return null;
      }

      const [owner] = await transaction
        .select({ id: owners.id })
        .from(owners)
        .where(and(eq(owners.id, identity.ownerId), eq(owners.status, "ACTIVE")))
        .limit(1);

      return owner ? { ownerId: owner.id } : null;
    }

    const [owner] = await transaction
      .select({ id: owners.id })
      .from(owners)
      .where(and(eq(owners.id, input.ownerId), eq(owners.status, "ACTIVE")))
      .limit(1);

    if (!owner) {
      return null;
    }

    await transaction
      .insert(adminIdentities)
      .values({
        authUserId: account.authUserId,
        email: account.email,
        hostedDomain,
        ownerId: owner.id,
        providerSubject: account.providerSubject,
      })
      .onConflictDoNothing();

    const [provisionedIdentity] = await transaction
      .select({
        authUserId: adminIdentities.authUserId,
        email: adminIdentities.email,
        ownerId: adminIdentities.ownerId,
        providerSubject: adminIdentities.providerSubject,
        status: adminIdentities.status,
      })
      .from(adminIdentities)
      .where(eq(adminIdentities.authUserId, account.authUserId))
      .limit(1);

    if (
      !provisionedIdentity ||
      provisionedIdentity.email !== account.email ||
      provisionedIdentity.ownerId !== owner.id ||
      provisionedIdentity.providerSubject !== account.providerSubject ||
      provisionedIdentity.status !== "ACTIVE"
    ) {
      return null;
    }

    return { ownerId: owner.id };
  });
}

import "server-only";

import {
  createCredentialReferenceSchema,
  credentialReferenceSchema,
  type CreateCredentialReference,
  type CredentialReference,
} from "@kershell/domain";
import { and, asc, eq, isNull } from "drizzle-orm";

import type { KershellDatabase } from "../client";
import { credentialReferences, projects } from "../schema";

export type CredentialReferenceDto = Omit<CredentialReference, "ownerId">;

function values(input: CreateCredentialReference) {
  const reference = createCredentialReferenceSchema.parse(input);

  return {
    ...reference,
    lastRotatedAt: reference.lastRotatedAt
      ? new Date(reference.lastRotatedAt)
      : null,
  };
}

function toDto(
  row: typeof credentialReferences.$inferSelect,
): CredentialReferenceDto {
  const parsed = credentialReferenceSchema.parse({
    ...row,
    createdAt: row.createdAt.toISOString(),
    lastRotatedAt: row.lastRotatedAt?.toISOString() ?? null,
    updatedAt: row.updatedAt.toISOString(),
  });
  const { ownerId, ...dto } = parsed;
  void ownerId;

  return dto;
}

async function projectBelongsToOwner(
  db: KershellDatabase,
  ownerId: string,
  projectId: string | null,
) {
  if (!projectId) {
    return true;
  }

  const match = await db
    .select({ id: projects.id })
    .from(projects)
    .where(
      and(
        eq(projects.id, projectId),
        eq(projects.ownerId, ownerId),
        isNull(projects.archivedAt),
      ),
    )
    .limit(1);
  return match.length === 1;
}

export async function listCredentialReferences(
  db: KershellDatabase,
  ownerId: string,
  projectId?: string,
): Promise<CredentialReferenceDto[]> {
  const rows = await db
    .select()
    .from(credentialReferences)
    .where(
      and(
        eq(credentialReferences.ownerId, ownerId),
        projectId
          ? eq(credentialReferences.projectId, projectId)
          : undefined,
      ),
    )
    .orderBy(asc(credentialReferences.name));

  return rows.map(toDto);
}

export async function getCredentialReference(
  db: KershellDatabase,
  ownerId: string,
  id: string,
): Promise<CredentialReferenceDto | null> {
  const matches = await db
    .select()
    .from(credentialReferences)
    .where(
      and(
        eq(credentialReferences.id, id),
        eq(credentialReferences.ownerId, ownerId),
      ),
    )
    .limit(2);
  const row = matches.length === 1 ? matches[0] : null;

  return row ? toDto(row) : null;
}

export async function createCredentialReference(
  db: KershellDatabase,
  ownerId: string,
  input: CreateCredentialReference,
): Promise<string> {
  const data = values(input);

  if (!(await projectBelongsToOwner(db, ownerId, data.projectId))) {
    throw new Error("Credential project is outside owner scope.");
  }

  const [created] = await db
    .insert(credentialReferences)
    .values({ ownerId, ...data })
    .returning({ id: credentialReferences.id });

  if (!created) {
    throw new Error("Credential reference insert failed.");
  }

  return created.id;
}

export async function updateCredentialReference(
  db: KershellDatabase,
  ownerId: string,
  id: string,
  input: CreateCredentialReference,
): Promise<boolean> {
  const data = values(input);

  if (!(await projectBelongsToOwner(db, ownerId, data.projectId))) {
    throw new Error("Credential project is outside owner scope.");
  }

  const updated = await db
    .update(credentialReferences)
    .set({ ...data, updatedAt: new Date() })
    .where(
      and(
        eq(credentialReferences.id, id),
        eq(credentialReferences.ownerId, ownerId),
      ),
    )
    .returning({ id: credentialReferences.id });

  return updated.length === 1;
}

export async function deleteCredentialReference(
  db: KershellDatabase,
  ownerId: string,
  id: string,
): Promise<boolean> {
  const deleted = await db
    .delete(credentialReferences)
    .where(
      and(
        eq(credentialReferences.id, id),
        eq(credentialReferences.ownerId, ownerId),
      ),
    )
    .returning({ id: credentialReferences.id });

  return deleted.length === 1;
}

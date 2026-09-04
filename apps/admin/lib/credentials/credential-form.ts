import {
  createCredentialReferenceSchema,
  type CreateCredentialReference,
} from "@kershell/domain";

export type CredentialActionState = {
  fieldErrors?: Partial<Record<keyof CreateCredentialReference, string[]>>;
  message?: string;
};
export const initialCredentialActionState: CredentialActionState = {};

function text(data: FormData, key: string) {
  const value = data.get(key);

  return typeof value === "string" ? value.trim() : "";
}

export function parseCredentialFormData(data: FormData, projectId: string) {
  const rotated = text(data, "lastRotatedOn");
  const interval = text(data, "rotationIntervalDays");

  return createCredentialReferenceSchema.safeParse({
    credentialType: text(data, "credentialType"),
    environment: text(data, "environment"),
    externalItemId: text(data, "externalItemId"),
    lastRotatedAt: rotated
      ? new Date(`${rotated}T00:00:00.000Z`).toISOString()
      : null,
    name: text(data, "name"),
    notes: text(data, "notes") || null,
    projectId,
    rotationIntervalDays: interval ? Number(interval) : null,
    secretProvider: text(data, "secretProvider"),
    service: text(data, "service"),
  });
}

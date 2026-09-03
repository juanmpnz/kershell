import { z } from "zod";

import {
  entityIdSchema,
  isoDateTimeSchema,
  nullableNotesSchema,
  timestampsShape,
} from "./shared";

export const credentialEnvironmentSchema = z.enum([
  "PRODUCTION",
  "STAGING",
  "DEVELOPMENT",
  "SHARED",
]);
export const credentialTypeSchema = z.enum([
  "API_KEY",
  "LOGIN",
  "CONNECTION_STRING",
  "DEPLOY_TOKEN",
  "DSN",
  "OAUTH_CLIENT",
  "SSH_KEY",
]);
export const secretProviderSchema = z.enum([
  "ONEPASSWORD",
  "BITWARDEN",
  "KEEPASSXC",
  "OTHER",
]);

const externalItemIdSchema = z
  .string()
  .trim()
  .min(3)
  .max(200)
  .regex(/^[A-Za-z0-9][A-Za-z0-9._:-]+$/)
  .refine((value) => !value.includes("://"), "External item IDs must be opaque.");

export const createCredentialReferenceSchema = z.strictObject({
  projectId: entityIdSchema.nullable(),
  name: z.string().trim().min(1).max(120),
  service: z.string().trim().min(1).max(120),
  environment: credentialEnvironmentSchema,
  credentialType: credentialTypeSchema,
  secretProvider: secretProviderSchema,
  externalItemId: externalItemIdSchema,
  lastRotatedAt: isoDateTimeSchema.nullable(),
  rotationIntervalDays: z.number().int().positive().max(3_650).nullable(),
  notes: nullableNotesSchema,
});

export const credentialReferenceSchema = z.strictObject({
  id: entityIdSchema,
  ownerId: entityIdSchema,
  ...createCredentialReferenceSchema.shape,
  ...timestampsShape,
});

export type CreateCredentialReference = z.infer<
  typeof createCredentialReferenceSchema
>;
export type CredentialEnvironment = z.infer<typeof credentialEnvironmentSchema>;
export type CredentialReference = z.infer<typeof credentialReferenceSchema>;
export type CredentialType = z.infer<typeof credentialTypeSchema>;
export type SecretProvider = z.infer<typeof secretProviderSchema>;

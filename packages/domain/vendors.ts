import { z } from "zod";

import {
  entityIdSchema,
  nullableNotesSchema,
  timestampsShape,
  webUrlSchema,
} from "./shared";

export const vendorIdSchema = entityIdSchema;

export const createVendorSchema = z.strictObject({
  name: z.string().trim().min(1).max(120),
  websiteUrl: webUrlSchema.nullable(),
  notes: nullableNotesSchema,
});

export const vendorSchema = z.strictObject({
  id: vendorIdSchema,
  ownerId: entityIdSchema,
  ...createVendorSchema.shape,
  ...timestampsShape,
});

export type CreateVendor = z.infer<typeof createVendorSchema>;
export type Vendor = z.infer<typeof vendorSchema>;

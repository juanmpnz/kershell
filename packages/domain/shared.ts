import { z } from "zod";

export const entityIdSchema = z.uuid();
export const isoDateSchema = z.iso.date();
export const isoDateTimeSchema = z.iso.datetime();

export const nullableNotesSchema = z.string().trim().max(5_000).nullable();

export const webUrlSchema = z.url({ protocol: /^https?$/ }).max(2_048);

export const timestampsShape = {
  createdAt: isoDateTimeSchema,
  updatedAt: isoDateTimeSchema,
} as const;

export function hasDuplicates(values: readonly string[]) {
  const normalized = values.map((value) => value.toLocaleLowerCase("en"));
  return new Set(normalized).size !== normalized.length;
}

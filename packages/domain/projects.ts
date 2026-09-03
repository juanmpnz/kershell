import { z } from "zod";

import {
  entityIdSchema,
  hasDuplicates,
  isoDateSchema,
  isoDateTimeSchema,
  timestampsShape,
} from "./shared";

export const projectStatusSchema = z.enum(["LIVE", "BETA", "PAUSED"]);

const technologiesSchema = z
  .array(z.string().trim().min(1).max(60))
  .max(30)
  .superRefine((technologies, context) => {
    if (hasDuplicates(technologies)) {
      context.addIssue({
        code: "custom",
        message: "Technologies must be unique.",
      });
    }
  });

export const createProjectSchema = z.strictObject({
  name: z.string().trim().min(1).max(120),
  code: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9][A-Z0-9_-]{1,31}$/),
  status: projectStatusSchema,
  stage: z.string().trim().min(1).max(120),
  summary: z.string().trim().min(1).max(2_000),
  technologies: technologiesSchema,
  color: z.string().regex(/^#[0-9A-F]{6}$/i),
  startedOn: isoDateSchema.nullable(),
});

export const projectSchema = z.strictObject({
  id: entityIdSchema,
  ownerId: entityIdSchema,
  ...createProjectSchema.shape,
  archivedAt: isoDateTimeSchema.nullable(),
  ...timestampsShape,
});

export type CreateProject = z.infer<typeof createProjectSchema>;
export type Project = z.infer<typeof projectSchema>;
export type ProjectStatus = z.infer<typeof projectStatusSchema>;

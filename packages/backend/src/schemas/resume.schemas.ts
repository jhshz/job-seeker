// packages/backend/src/schemas/resume.schemas.ts
import { z } from "zod";
import { mongoIdSchema } from "./common.schemas";

// Re-use from seeker (same shape)
const educationEntrySchema = z.object({
  institution: z.string().min(1),
  degree: z.string().min(1),
  field: z.string().default(""),
  startYear: z.number().int(),
  endYear: z.number().int().nullable().default(null),
  description: z.string().optional(),
});

const experienceEntrySchema = z.object({
  company: z.string().min(1),
  title: z.string().min(1),
  location: z.string().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().nullable().default(null),
  current: z.boolean().default(false),
  description: z.string().optional(),
});

export const createResumeBodySchema = z.object({
  fullName: z.string().min(1),
  headline: z.string().default(""),
  location: z.string().default(""),
  about: z.string().default(""),
  skills: z.array(z.string()).default([]),
  education: z.array(educationEntrySchema).default([]),
  experience: z.array(experienceEntrySchema).default([]),
});

export const resumeIdParamSchema = z.object({
  resumeId: mongoIdSchema,
});

export type CreateResumeBodyInput = z.infer<typeof createResumeBodySchema>;

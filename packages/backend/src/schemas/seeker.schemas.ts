// packages/backend/src/schemas/seeker.schemas.ts
import { z } from "zod";
import { mongoIdSchema } from "./common.schemas";

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

export const updateSeekerProfileSchema = z.object({
  fullName: z.string().min(1).max(200).optional(),
  headline: z.string().max(300).optional(),
  location: z.string().max(200).optional(),
  about: z.string().max(5000).optional(),
  skills: z.array(z.string().max(100)).max(50).optional(),
  education: z.array(educationEntrySchema).max(20).optional(),
  experience: z.array(experienceEntrySchema).max(20).optional(),
  avatarFileId: mongoIdSchema.nullable().optional(),
});

export const createResumeSchema = z.object({
  title: z.string().max(120).default(""),
  fullName: z.string().min(1),
  headline: z.string().default(""),
  location: z.string().default(""),
  about: z.string().default(""),
  skills: z.array(z.string()).default([]),
  education: z.array(educationEntrySchema).default([]),
  experience: z.array(experienceEntrySchema).default([]),
});

export const applyJobSchema = z.object({
  resumeId: mongoIdSchema,
  coverLetter: z.string().max(2000).default(""),
});

export const seekerResumeIdParamSchema = z.object({
  resumeId: mongoIdSchema,
});

export type UpdateSeekerProfileInput = z.infer<typeof updateSeekerProfileSchema>;
export type CreateResumeInput = z.infer<typeof createResumeSchema>;
export type ApplyJobInput = z.infer<typeof applyJobSchema>;

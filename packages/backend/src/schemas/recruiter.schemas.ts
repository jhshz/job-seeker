// packages/backend/src/schemas/recruiter.schemas.ts
import { z } from "zod";
import { mongoIdSchema } from "./common.schemas";

export const updateRecruiterProfileSchema = z.object({
  companyName: z.string().min(1).max(200).optional(),
  companyDescription: z.string().max(5000).optional(),
  website: z.string().url().max(500).or(z.literal("")).optional(),
  logoFileId: mongoIdSchema.nullable().optional(),
  location: z.string().max(200).optional(),
  industry: z.string().max(100).optional(),
  size: z.string().max(50).optional(),
});

export const createJobSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  status: z.enum(["draft", "published", "closed"]).default("draft"),
  type: z.array(z.enum(["full-time", "part-time", "contract", "internship", "freelance", "remote", "hybrid"])).default([]),
  location: z.string().default(""),
  salaryMin: z.number().nullable().optional(),
  salaryMax: z.number().nullable().optional(),
  salaryCurrency: z.string().default("IRR"),
  salaryPeriod: z.enum(["hourly", "monthly", "yearly"]).default("monthly"),
  showSalary: z.boolean().default(false),
  tags: z.array(z.string().max(50)).default([]),
});

export const updateJobSchema = createJobSchema.partial();

export const recruiterJobIdParamSchema = z.object({
  jobId: mongoIdSchema,
});

export const recruiterIdParamSchema = z.object({
  recruiterId: mongoIdSchema,
});

export type UpdateRecruiterProfileInput = z.infer<typeof updateRecruiterProfileSchema>;
export type CreateJobInput = z.infer<typeof createJobSchema>;
export type UpdateJobInput = z.infer<typeof updateJobSchema>;

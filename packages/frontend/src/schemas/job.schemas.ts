import { z } from "zod";

const jobTypeEnum = z.enum([
  "full-time",
  "part-time",
  "contract",
  "internship",
  "freelance",
  "remote",
  "hybrid",
]);

const statusEnum = z.enum(["draft", "published", "closed"]);

export const createJobSchema = z.object({
  title: z.string().min(1, "عنوان الزامی است").max(200),
  description: z.string().min(1, "توضیحات الزامی است"),
  status: statusEnum.default("draft"),
  type: z.array(jobTypeEnum).default([]),
  location: z.string().default(""),
  salaryMin: z.number().nullable().optional(),
  salaryMax: z.number().nullable().optional(),
  salaryCurrency: z.string().default("IRR"),
  salaryPeriod: z.enum(["hourly", "monthly", "yearly"]).default("monthly"),
  showSalary: z.boolean().default(false),
  tags: z.array(z.string().max(50)).default([]),
});

export const updateJobSchema = createJobSchema.partial();

export const jobFiltersSchema = z.object({
  q: z.string().optional(),
  location: z.string().optional(),
  type: z.string().optional(),
  tags: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const applyJobSchema = z.object({
  resumeId: z.string().regex(/^[a-fA-F0-9]{24}$/, "شناسه رزومه نامعتبر است"),
  coverLetter: z.string().max(2000).default(""),
});

export type CreateJobInput = z.infer<typeof createJobSchema>;
export type UpdateJobInput = z.infer<typeof updateJobSchema>;
export type JobFiltersInput = z.infer<typeof jobFiltersSchema>;
export type ApplyJobInput = z.infer<typeof applyJobSchema>;

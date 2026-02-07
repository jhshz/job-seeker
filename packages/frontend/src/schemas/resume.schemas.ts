import { z } from "zod";

const educationEntrySchema = z.object({
  institution: z.string().min(1, "نام مؤسسه الزامی است"),
  degree: z.string().min(1, "مدرک الزامی است"),
  field: z.string().default(""),
  startYear: z.number().int(),
  endYear: z.number().int().nullable().default(null),
  description: z.string().optional(),
});

const experienceEntrySchema = z.object({
  company: z.string().min(1, "نام شرکت الزامی است"),
  title: z.string().min(1, "عنوان شغلی الزامی است"),
  location: z.string().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().nullable().default(null),
  current: z.boolean().default(false),
  description: z.string().optional(),
});

export const createResumeSchema = z.object({
  fullName: z.string().min(1, "نام و نام خانوادگی الزامی است"),
  headline: z.string().default(""),
  location: z.string().default(""),
  about: z.string().default(""),
  skills: z.array(z.string()).default([]),
  education: z.array(educationEntrySchema).default([]),
  experience: z.array(experienceEntrySchema).default([]),
});

export type CreateResumeInput = z.infer<typeof createResumeSchema>;

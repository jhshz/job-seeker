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

export const updateSeekerProfileSchema = z.object({
  fullName: z.string().min(1).max(200).optional(),
  headline: z.string().max(300).optional(),
  location: z.string().max(200).optional(),
  about: z.string().max(5000).optional(),
  skills: z.array(z.string().max(100)).max(50).optional(),
  education: z.array(educationEntrySchema).max(20).optional(),
  experience: z.array(experienceEntrySchema).max(20).optional(),
});

export const updateRecruiterProfileSchema = z.object({
  companyName: z.string().min(1).max(200).optional(),
  companyDescription: z.string().max(5000).optional(),
  website: z.string().url().max(500).or(z.literal("")).optional(),
  location: z.string().max(200).optional(),
  industry: z.string().max(100).optional(),
  size: z.string().max(50).optional(),
});

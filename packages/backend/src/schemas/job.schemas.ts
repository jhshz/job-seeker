// packages/backend/src/schemas/job.schemas.ts
import { z } from "zod";
import { paginationQuerySchema } from "./common.schemas";
import { mongoIdSchema } from "./common.schemas";

export const listJobsQuerySchema = paginationQuerySchema.and(
  z.object({
    q: z.string().max(200).optional(),
    location: z.string().max(200).optional(),
    type: z.string().max(50).optional(),
    tags: z.string().max(500).optional(), // comma-separated
    salaryMin: z.coerce.number().optional(),
    salaryMax: z.coerce.number().optional(),
    status: z.enum(["draft", "published", "closed"]).optional(),
  }),
);

export const jobIdParamSchema = z.object({
  jobId: mongoIdSchema,
});

export type ListJobsQueryInput = z.infer<typeof listJobsQuerySchema>;

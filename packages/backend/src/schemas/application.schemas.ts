// packages/backend/src/schemas/application.schemas.ts
import { z } from "zod";
import { paginationQuerySchema } from "./common.schemas";

export const listApplicationsQuerySchema = paginationQuerySchema.and(
  z.object({
    status: z.enum(["applied", "reviewing", "interview", "offered", "rejected", "withdrawn"]).optional(),
  }),
);

export type ListApplicationsQueryInput = z.infer<typeof listApplicationsQuerySchema>;

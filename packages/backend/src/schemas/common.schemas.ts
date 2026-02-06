// packages/backend/src/schemas/common.schemas.ts
import { z } from "zod";

import { normalizePhoneE164 } from "@utils";

export const phoneE164Schema = z
  .string()
  .min(1, "Phone is required")
  .transform((s) => {
    const t = s.trim().replace(/[\s-]/g, "");
    if (/^\+98[0-9]{10}$/.test(t)) return t;
    try {
      return normalizePhoneE164(s);
    } catch {
      return t;
    }
  })
  .refine(
    (s) => /^\+98[0-9]{10}$/.test(s),
    "Invalid E.164 phone (e.g. +989123456789)",
  );

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const mongoIdSchema = z.string().regex(/^[a-fA-F0-9]{24}$/, "Invalid ID");

export type PhoneE164 = z.infer<typeof phoneE164Schema>;
export type PaginationQueryInput = z.infer<typeof paginationQuerySchema>;

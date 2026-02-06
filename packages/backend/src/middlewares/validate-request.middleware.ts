import type { Request, Response, NextFunction } from "express";
import { z, type ZodSchema } from "zod";
import { AppError } from "./error-handler.middleware";

/**
 * Middleware to validate request body/query/params using Zod schema
 */
export function validateRequest(schema: {
  body?: ZodSchema<unknown>;
  query?: ZodSchema<unknown>;
  params?: ZodSchema<unknown>;
}) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schema.body) {
        req.body = await schema.body.parseAsync(req.body);
      }
      if (schema.query) {
        req.query = (await schema.query.parseAsync(req.query)) as Request["query"];
      }
      if (schema.params) {
        req.params = (await schema.params.parseAsync(req.params)) as Request["params"];
      }
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const details = error.issues.map((err: z.ZodIssue) => ({
          path: err.path.join("."),
          message: err.message,
        }));
        throw new AppError("Validation failed", 400, false, "VALIDATION_ERROR", details);
      }
      next(error);
    }
  };
}

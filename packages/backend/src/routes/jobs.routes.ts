// packages/backend/src/routes/jobs.routes.ts
import { Router } from "express";
import * as jobController from "@controllers/job.controller";
import * as seekerController from "@controllers/seeker.controller";
import { requireAuth, requireRole, validateRequest } from "@middlewares";
import { listJobsQuerySchema, jobIdParamSchema } from "@schemas";
import { applyJobSchema } from "@schemas";

const router = Router();

router.get(
  "/",
  validateRequest({ query: listJobsQuerySchema }),
  jobController.listPublic,
);
router.get(
  "/:jobId",
  validateRequest({ params: jobIdParamSchema }),
  jobController.getPublicById,
);

router.post(
  "/:jobId/apply",
  requireAuth,
  requireRole("seeker"),
  validateRequest({ params: jobIdParamSchema, body: applyJobSchema }),
  seekerController.applyToJob,
);

export default router;

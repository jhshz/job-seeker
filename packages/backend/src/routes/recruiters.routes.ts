// packages/backend/src/routes/recruiters.routes.ts
import { Router } from "express";
import * as recruiterController from "@controllers/recruiter.controller";
import * as jobController from "@controllers/job.controller";
import { requireAuth, requireRole, validateRequest } from "@middlewares";
import {
  updateRecruiterProfileSchema,
  createJobSchema,
  updateJobSchema,
  recruiterJobIdParamSchema,
  recruiterIdParamSchema,
} from "@schemas";
import { listApplicationsQuerySchema } from "@schemas";

const router = Router();

router.get("/me", requireAuth, requireRole("recruiter"), recruiterController.getMe);
router.patch(
  "/me",
  requireAuth,
  requireRole("recruiter"),
  validateRequest({ body: updateRecruiterProfileSchema }),
  recruiterController.updateMe,
);

router.get(
  "/:recruiterId",
  validateRequest({ params: recruiterIdParamSchema }),
  jobController.getRecruiterPublic,
);

router.post(
  "/jobs",
  requireAuth,
  requireRole("recruiter"),
  validateRequest({ body: createJobSchema }),
  recruiterController.createJob,
);
router.get("/jobs", requireAuth, requireRole("recruiter"), recruiterController.listJobs);
router.patch(
  "/jobs/:jobId",
  requireAuth,
  requireRole("recruiter"),
  validateRequest({ params: recruiterJobIdParamSchema, body: updateJobSchema }),
  recruiterController.updateJob,
);
router.get(
  "/jobs/:jobId/applications",
  requireAuth,
  requireRole("recruiter"),
  validateRequest({ params: recruiterJobIdParamSchema, query: listApplicationsQuerySchema }),
  recruiterController.getJobApplications,
);

export default router;

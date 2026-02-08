// packages/backend/src/routes/seekers.routes.ts
import { Router } from "express";
import * as seekerController from "../controllers/seeker.controller";
import { requireAuth, requireRole, validateRequest } from "@middlewares";
import {
  updateSeekerProfileSchema,
  createResumeSchema,
  seekerResumeIdParamSchema,
} from "@schemas";
import { listApplicationsQuerySchema } from "@schemas";

const router = Router();

router.use(requireAuth, requireRole("seeker"));

router.get("/me", seekerController.getMe);
router.patch(
  "/me",
  validateRequest({ body: updateSeekerProfileSchema }),
  seekerController.updateMe,
);

router.get(
  "/me/applications",
  validateRequest({ query: listApplicationsQuerySchema }),
  seekerController.getMyApplications,
);

router.get("/me/resumes", seekerController.getMyResumes);
router.get(
  "/me/resumes/:resumeId",
  validateRequest({ params: seekerResumeIdParamSchema }),
  seekerController.getResume,
);
router.post(
  "/me/resumes",
  validateRequest({ body: createResumeSchema }),
  seekerController.createResume,
);
router.patch(
  "/me/resumes/:resumeId",
  validateRequest({ params: seekerResumeIdParamSchema, body: createResumeSchema }),
  seekerController.updateResume,
);
router.delete(
  "/me/resumes/:resumeId",
  validateRequest({ params: seekerResumeIdParamSchema }),
  seekerController.deleteResume,
);
router.patch(
  "/me/resumes/:resumeId/activate",
  validateRequest({ params: seekerResumeIdParamSchema }),
  seekerController.activateResume,
);

export default router;

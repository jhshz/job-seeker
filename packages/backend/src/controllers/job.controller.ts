// packages/backend/src/controllers/job.controller.ts
import type { Request, Response } from "express";
import { jobService } from "@services";
import { recruiterService } from "@services";
import { sendSuccess, catchAsync } from "@utils";

export const listPublic = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const query = req.query as { page?: number; limit?: number; q?: string; location?: string; type?: string; tags?: string; salaryMin?: number; salaryMax?: number; status?: string };
  const { list, meta } = await jobService.listPublic(query);
  sendSuccess(res, list, 200, meta);
});

export const getPublicById = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { jobId } = req.params;
  const job = await jobService.getPublicById(jobId);
  sendSuccess(res, job);
});

export const getRecruiterPublic = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { recruiterId } = req.params;
  const profile = await recruiterService.getProfileById(recruiterId);
  sendSuccess(res, profile);
});

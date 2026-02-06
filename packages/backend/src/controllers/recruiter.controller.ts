// packages/backend/src/controllers/recruiter.controller.ts
import type { Request, Response } from "express";
import { recruiterService } from "@services";
import { sendSuccess, catchAsync } from "@utils";
import { AppError } from "@middlewares";

async function getRecruiterId(req: Request): Promise<string> {
  if (!req.user) throw new AppError("Authentication required", 401, false, "AUTH_REQUIRED");
  const profile = await recruiterService.getOrCreateProfile(req.user.id);
  return profile._id.toString();
}

export const getMe = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const profile = await recruiterService.getOrCreateProfile(req.user!.id);
  sendSuccess(res, profile);
});

export const updateMe = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const profile = await recruiterService.updateProfile(req.user!.id, req.body);
  sendSuccess(res, profile);
});

export const createJob = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const recruiterId = await getRecruiterId(req);
  const job = await recruiterService.createJob(recruiterId, req.body);
  sendSuccess(res, job, 201);
});

export const listJobs = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const recruiterId = await getRecruiterId(req);
  const { page = 1, limit = 20, status } = req.query;
  const { list, meta } = await recruiterService.listRecruiterJobs(
    recruiterId,
    Number(page),
    Number(limit),
    status as string | undefined,
  );
  sendSuccess(res, list, 200, meta);
});

export const updateJob = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const recruiterId = await getRecruiterId(req);
  const { jobId } = req.params;
  const job = await recruiterService.updateJob(recruiterId, jobId, req.body);
  sendSuccess(res, job);
});

export const getJobApplications = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const recruiterId = await getRecruiterId(req);
  const { jobId } = req.params;
  const { page = 1, limit = 20, status } = req.query;
  const { list, meta } = await recruiterService.getJobApplications(
    recruiterId,
    jobId,
    Number(page),
    Number(limit),
    status as string | undefined,
  );
  sendSuccess(res, list, 200, meta);
});

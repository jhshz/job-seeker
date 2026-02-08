// packages/backend/src/controllers/seeker.controller.ts
import type { Request, Response } from "express";
import { seekerService } from "@services";
import { sendSuccess, catchAsync } from "@utils";
import { AppError } from "@middlewares";

function getSeekerId(req: Request): string {
  if (!req.user) throw new AppError("Authentication required", 401, false, "AUTH_REQUIRED");
  return req.user.id;
}

async function getSeekerProfileId(req: Request): Promise<string> {
  const profile = await seekerService.getOrCreateProfile(getSeekerId(req));
  return profile._id.toString();
}

export const getMe = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const profile = await seekerService.getOrCreateProfile(getSeekerId(req));
  sendSuccess(res, profile);
});

export const updateMe = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const profile = await seekerService.updateProfile(getSeekerId(req), req.body);
  sendSuccess(res, profile);
});

export const getMyApplications = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const seekerId = await getSeekerProfileId(req);
  const { page = 1, limit = 20, status } = req.query;
  const { list, meta } = await seekerService.getMyApplications(
    seekerId,
    Number(page),
    Number(limit),
    status as string | undefined,
  );
  sendSuccess(res, list, 200, meta as unknown as Record<string, unknown>);
});

export const applyToJob = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const seekerId = await getSeekerProfileId(req);
  const jobId = req.params.jobId;
  if (typeof jobId !== "string") throw new AppError("Invalid job id", 400, false, "INVALID_PARAMS");
  const application = await seekerService.applyToJob(seekerId, jobId, req.body);
  sendSuccess(res, application, 201);
});

export const getMyResumes = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const seekerId = await getSeekerProfileId(req);
  const list = await seekerService.getResumes(seekerId);
  sendSuccess(res, list);
});

export const getResume = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const seekerId = await getSeekerProfileId(req);
  const resumeId = req.params.resumeId;
  if (typeof resumeId !== "string") throw new AppError("Invalid resume id", 400, false, "INVALID_PARAMS");
  const resume = await seekerService.getResume(seekerId, resumeId);
  sendSuccess(res, resume);
});

export const createResume = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const seekerId = await getSeekerProfileId(req);
  const resume = await seekerService.createResume(seekerId, req.body);
  sendSuccess(res, resume, 201);
});

export const updateResume = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const seekerId = await getSeekerProfileId(req);
  const resumeId = req.params.resumeId;
  if (typeof resumeId !== "string") throw new AppError("Invalid resume id", 400, false, "INVALID_PARAMS");
  const resume = await seekerService.updateResume(seekerId, resumeId, req.body);
  sendSuccess(res, resume);
});

export const deleteResume = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const seekerId = await getSeekerProfileId(req);
  const resumeId = req.params.resumeId;
  if (typeof resumeId !== "string") throw new AppError("Invalid resume id", 400, false, "INVALID_PARAMS");
  const result = await seekerService.deleteResume(seekerId, resumeId);
  sendSuccess(res, result);
});

export const activateResume = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const seekerId = await getSeekerProfileId(req);
  const resumeId = req.params.resumeId;
  if (typeof resumeId !== "string") throw new AppError("Invalid resume id", 400, false, "INVALID_PARAMS");
  const resume = await seekerService.activateResume(seekerId, resumeId);
  sendSuccess(res, resume);
});

// packages/backend/src/controllers/job.controller.ts
import type { Request, Response } from "express";
import { jobService } from "@services";
import { recruiterService } from "@services";
import { sendSuccess, catchAsync } from "@utils";
import type { ListJobsQueryInput } from "@schemas";
import { AppError } from "@middlewares";

export const listPublic = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const q = req.query as Record<string, unknown>;
  const query: ListJobsQueryInput = {
    page: Number(q.page) || 1,
    limit: Number(q.limit) || 20,
    q: q.q as string | undefined,
    location: q.location as string | undefined,
    type: q.type as string | undefined,
    tags: q.tags as string | undefined,
    salaryMin: q.salaryMin != null ? Number(q.salaryMin) : undefined,
    salaryMax: q.salaryMax != null ? Number(q.salaryMax) : undefined,
    status: q.status as ListJobsQueryInput["status"],
  };
  const { list, meta } = await jobService.listPublic(query);
  sendSuccess(res, list, 200, meta as unknown as Record<string, unknown>);
});

export const getPublicById = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const jobId = req.params.jobId;
  if (typeof jobId !== "string") throw new AppError("Invalid job id", 400, false, "INVALID_PARAMS");
  const job = await jobService.getPublicById(jobId);
  sendSuccess(res, job);
});

export const getRecruiterPublic = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const recruiterId = req.params.recruiterId;
  if (typeof recruiterId !== "string") throw new AppError("Invalid recruiter id", 400, false, "INVALID_PARAMS");
  const profile = await recruiterService.getProfileById(recruiterId);
  sendSuccess(res, profile);
});

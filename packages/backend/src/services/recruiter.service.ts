// packages/backend/src/services/recruiter.service.ts
import mongoose from "mongoose";
import { RecruiterProfile, Job, JobApplication } from "@models";
import { AppError } from "@middlewares";
import type { UpdateRecruiterProfileInput, CreateJobInput, UpdateJobInput } from "@schemas";
import { getPaginationQuery, getPaginationMeta } from "@utils";
import { toJobResponse, type LeanJob } from "./job.service";

export class RecruiterService {
  async getProfileByUserId(userId: string) {
    const profile = await RecruiterProfile.findOne({
      userId: new mongoose.Types.ObjectId(userId),
    });
    if (!profile) {
      throw new AppError("Recruiter profile not found", 404, false, "PROFILE_NOT_FOUND");
    }
    return profile;
  }

  async getProfileById(recruiterId: string) {
    const profile = await RecruiterProfile.findById(recruiterId)
      .populate("logoFileId", "url")
      .lean();
    if (!profile) {
      throw new AppError("Recruiter not found", 404, false, "RECRUITER_NOT_FOUND");
    }
    return profile;
  }

  async getOrCreateProfile(userId: string, initialData?: { companyName?: string }) {
    let profile = await RecruiterProfile.findOne({
      userId: new mongoose.Types.ObjectId(userId),
    });
    if (!profile) {
      const companyName = (initialData?.companyName?.trim()?.length
        ? initialData.companyName.trim()
        : "شرکت") as string;
      profile = await RecruiterProfile.create({
        userId: new mongoose.Types.ObjectId(userId),
        companyName,
        companyDescription: "",
        website: "",
        location: "",
        industry: "",
        size: "",
      });
    }
    return profile;
  }

  async updateProfile(userId: string, data: UpdateRecruiterProfileInput) {
    const profile = await this.getOrCreateProfile(userId);
    Object.assign(profile, data);
    await profile.save();
    return profile;
  }

  async createJob(recruiterId: string, input: CreateJobInput) {
    const job = await Job.create({
      recruiterId: new mongoose.Types.ObjectId(recruiterId),
      title: input.title,
      description: input.description,
      status: input.status ?? "draft",
      type: input.type ?? [],
      location: input.location ?? "",
      salaryMin: input.salaryMin ?? null,
      salaryMax: input.salaryMax ?? null,
      salaryCurrency: input.salaryCurrency ?? "IRR",
      salaryPeriod: input.salaryPeriod ?? "monthly",
      showSalary: input.showSalary ?? false,
      tags: input.tags ?? [],
    });
    return toJobResponse(job.toObject() as unknown as LeanJob);
  }

  async listRecruiterJobs(recruiterId: string, page: number, limit: number, status?: string) {
    const { skip } = getPaginationQuery(page, limit);
    const filter: Record<string, unknown> = {
      recruiterId: new mongoose.Types.ObjectId(recruiterId),
    };
    if (status) filter.status = status;
    const [rawList, total] = await Promise.all([
      Job.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Job.countDocuments(filter),
    ]);
    const list = (rawList as unknown as LeanJob[]).map(toJobResponse);
    const meta = getPaginationMeta(page, limit, total);
    return { list, meta };
  }

  async getRecruiterJob(recruiterId: string, jobId: string) {
    const job = await Job.findOne({
      _id: jobId,
      recruiterId: new mongoose.Types.ObjectId(recruiterId),
    }).lean();
    if (!job) throw new AppError("Job not found", 404, false, "JOB_NOT_FOUND");
    return toJobResponse(job as unknown as LeanJob);
  }

  async updateJob(recruiterId: string, jobId: string, data: UpdateJobInput) {
    const job = await Job.findOne({
      _id: jobId,
      recruiterId: new mongoose.Types.ObjectId(recruiterId),
    });
    if (!job) throw new AppError("Job not found", 404, false, "JOB_NOT_FOUND");
    Object.assign(job, data);
    await job.save();
    return toJobResponse(job.toObject() as unknown as LeanJob);
  }

  async getJobApplications(recruiterId: string, jobId: string, page: number, limit: number, status?: string) {
    const job = await Job.findOne({
      _id: jobId,
      recruiterId: new mongoose.Types.ObjectId(recruiterId),
    });
    if (!job) throw new AppError("Job not found", 404, false, "JOB_NOT_FOUND");
    const { skip } = getPaginationQuery(page, limit);
    const filter: Record<string, unknown> = { jobId: job._id };
    if (status) filter.status = status;
    const [list, total] = await Promise.all([
      JobApplication.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("seekerId", "fullName headline location")
        .populate("resumeSnapshotId", "fullName headline skills")
        .lean(),
      JobApplication.countDocuments(filter),
    ]);
    const meta = getPaginationMeta(page, limit, total);
    return { list, meta };
  }
}

export const recruiterService = new RecruiterService();

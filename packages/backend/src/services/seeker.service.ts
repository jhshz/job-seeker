// packages/backend/src/services/seeker.service.ts
import mongoose from "mongoose";
import { SeekerProfile, Resume, JobApplication, Job } from "@models";
import { AppError } from "@middlewares";
import type { UpdateSeekerProfileInput, CreateResumeInput, ApplyJobInput } from "@schemas";
import { getPaginationQuery, getPaginationMeta } from "@utils";

export class SeekerService {
  async getProfileByUserId(userId: string) {
    const profile = await SeekerProfile.findOne({ userId: new mongoose.Types.ObjectId(userId) });
    if (!profile) {
      throw new AppError("Seeker profile not found", 404, false, "PROFILE_NOT_FOUND");
    }
    return profile;
  }

  async getOrCreateProfile(userId: string, initialData?: { fullName?: string }) {
    let profile = await SeekerProfile.findOne({ userId: new mongoose.Types.ObjectId(userId) });
    if (!profile) {
      profile = await SeekerProfile.create({
        userId: new mongoose.Types.ObjectId(userId),
        fullName: (initialData?.fullName?.trim()?.length ? initialData.fullName.trim() : "") as string,
        headline: "",
        location: "",
        about: "",
        skills: [],
        education: [],
        experience: [],
      });
    }
    return profile;
  }

  async updateProfile(userId: string, data: UpdateSeekerProfileInput) {
    const profile = await this.getOrCreateProfile(userId);
    Object.assign(profile, data);
    await profile.save();
    return profile;
  }

  async getMyApplications(seekerId: string, page: number, limit: number, status?: string) {
    const { skip } = getPaginationQuery(page, limit);
    const filter: Record<string, unknown> = { seekerId: new mongoose.Types.ObjectId(seekerId) };
    if (status) filter.status = status;
    const [list, total] = await Promise.all([
      JobApplication.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("jobId", "title status recruiterId createdAt")
        .populate("resumeSnapshotId", "fullName headline")
        .lean(),
      JobApplication.countDocuments(filter),
    ]);
    const meta = getPaginationMeta(page, limit, total);
    return { list, meta };
  }

  async applyToJob(seekerId: string, jobId: string, input: ApplyJobInput) {
    const jobOid = new mongoose.Types.ObjectId(jobId);
    const seekerOid = new mongoose.Types.ObjectId(seekerId);
    const job = await Job.findById(jobOid);
    if (!job) throw new AppError("Job not found", 404, false, "JOB_NOT_FOUND");
    if (job.status !== "published") {
      throw new AppError("Job is not open for applications", 400, false, "JOB_NOT_OPEN");
    }
    const resume = await Resume.findOne({
      _id: input.resumeId,
      seekerId: seekerOid,
    });
    if (!resume) throw new AppError("Resume not found", 404, false, "RESUME_NOT_FOUND");
    const existing = await JobApplication.findOne({ jobId: jobOid, seekerId: seekerOid });
    if (existing) {
      throw new AppError("Already applied to this job", 409, false, "ALREADY_APPLIED");
    }
    const application = await JobApplication.create({
      jobId: jobOid,
      seekerId: seekerOid,
      resumeSnapshotId: resume._id,
      coverLetter: input.coverLetter ?? "",
      status: "applied",
    });
    return application;
  }

  async getResumes(seekerId: string) {
    return Resume.find({ seekerId: new mongoose.Types.ObjectId(seekerId) })
      .sort({ createdAt: -1 })
      .lean();
  }

  async createResume(seekerId: string, input: CreateResumeInput) {
    const count = await Resume.countDocuments({ seekerId: new mongoose.Types.ObjectId(seekerId) });
    const resume = await Resume.create({
      seekerId: new mongoose.Types.ObjectId(seekerId),
      version: count + 1,
      isActive: count === 0,
      fullName: input.fullName,
      headline: input.headline ?? "",
      location: input.location ?? "",
      about: input.about ?? "",
      skills: input.skills ?? [],
      education: input.education ?? [],
      experience: input.experience ?? [],
    });
    return resume;
  }

  async activateResume(seekerId: string, resumeId: string) {
    const seekerOid = new mongoose.Types.ObjectId(seekerId);
    const resume = await Resume.findOne({ _id: resumeId, seekerId: seekerOid });
    if (!resume) throw new AppError("Resume not found", 404, false, "RESUME_NOT_FOUND");
    await Resume.updateMany({ seekerId: seekerOid }, { $set: { isActive: false } });
    resume.isActive = true;
    await resume.save();
    return resume;
  }
}

export const seekerService = new SeekerService();

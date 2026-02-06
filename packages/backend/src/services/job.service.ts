// packages/backend/src/services/job.service.ts
import { Job } from "@models";
import { AppError } from "@middlewares";
import type { ListJobsQueryInput } from "@schemas";
import { getPaginationQuery, getPaginationMeta } from "@utils";

export class JobService {
  async listPublic(query: ListJobsQueryInput) {
    const { page, limit, skip } = getPaginationQuery(query.page, query.limit);
    const filter: Record<string, unknown> = { status: "published" };
    if (query.q) {
      filter.$or = [
        { title: new RegExp(query.q, "i") },
        { description: new RegExp(query.q, "i") },
        { tags: new RegExp(query.q, "i") },
      ];
    }
    if (query.location) filter.location = new RegExp(query.location, "i");
    if (query.type) filter.type = query.type;
    if (query.tags) {
      const tags = query.tags.split(",").map((t) => t.trim()).filter(Boolean);
      if (tags.length) filter.tags = { $in: tags };
    }
    if (query.salaryMin != null) {
      filter.salaryMax = { $gte: query.salaryMin };
    }
    if (query.salaryMax != null) {
      filter.salaryMin = { $lte: query.salaryMax };
    }
    const [list, total] = await Promise.all([
      Job.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Job.countDocuments(filter),
    ]);
    const meta = getPaginationMeta(page, limit, total);
    return { list, meta };
  }

  async getPublicById(jobId: string) {
    const job = await Job.findOne({
      _id: jobId,
      status: "published",
    })
      .populate("recruiterId", "companyName companyDescription location industry logoFileId")
      .lean();
    if (!job) throw new AppError("Job not found", 404, false, "JOB_NOT_FOUND");
    return job;
  }

  async getById(jobId: string) {
    const job = await Job.findById(jobId).lean();
    if (!job) throw new AppError("Job not found", 404, false, "JOB_NOT_FOUND");
    return job;
  }
}

export const jobService = new JobService();

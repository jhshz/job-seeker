import mongoose, { Schema, type Document, type Model } from "mongoose";
import { JobStatus, JobType } from "@enums";

/**
 * Job - Job posting belonging to a recruiter.
 *
 * Design: Belongs to RecruiterProfile (via recruiterId) for company context.
 * Salary stored as min/max for range queries.
 */
export interface IJob extends Document {
  recruiterId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  status: "draft" | "published" | "closed";
  type: ("full-time" | "part-time" | "contract" | "internship" | "freelance" | "remote" | "hybrid")[];
  location: string;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string;
  salaryPeriod: "hourly" | "monthly" | "yearly";
  showSalary: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const jobSchema = new Schema<IJob>(
  {
    recruiterId: {
      type: Schema.Types.ObjectId,
      ref: "RecruiterProfile",
      required: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(JobStatus),
      default: JobStatus.DRAFT,
    },
    type: {
      type: [String],
      enum: Object.values(JobType),
      default: [],
    },
    location: { type: String, default: "", trim: true },
    salaryMin: { type: Number, default: null },
    salaryMax: { type: Number, default: null },
    salaryCurrency: { type: String, default: "IRR", trim: true },
    salaryPeriod: {
      type: String,
      enum: ["hourly", "monthly", "yearly"],
      default: "monthly",
    },
    showSalary: { type: Boolean, default: false },
    tags: { type: [String], default: [] },
  },
  { timestamps: true },
);

// Search indexes
jobSchema.index({ status: 1, createdAt: -1 });
jobSchema.index({ recruiterId: 1, status: 1 });
jobSchema.index({ location: 1, status: 1 });
jobSchema.index({ type: 1, status: 1 });
jobSchema.index({ tags: 1, status: 1 });
jobSchema.index({ createdAt: -1 });

export const Job: Model<IJob> =
  mongoose.models.Job || mongoose.model<IJob>("Job", jobSchema);

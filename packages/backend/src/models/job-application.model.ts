import mongoose, { Schema, type Document, type Model } from "mongoose";
import { ApplicationStatus } from "@enums";

/**
 * JobApplication - Application from seeker to job.
 *
 * Design:
 * - Unique (jobId, seekerId) - one application per seeker per job
 * - resumeSnapshotId: reference to Resume used at apply time (immutable)
 * - Status pipeline for recruiter workflow
 */
export interface IJobApplication extends Document {
  jobId: mongoose.Types.ObjectId;
  seekerId: mongoose.Types.ObjectId;
  resumeSnapshotId: mongoose.Types.ObjectId;
  status: "applied" | "reviewing" | "interview" | "offered" | "rejected" | "withdrawn";
  coverLetter: string;
  createdAt: Date;
  updatedAt: Date;
}

const jobApplicationSchema = new Schema<IJobApplication>(
  {
    jobId: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    seekerId: {
      type: Schema.Types.ObjectId,
      ref: "SeekerProfile",
      required: true,
    },
    resumeSnapshotId: {
      type: Schema.Types.ObjectId,
      ref: "Resume",
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(ApplicationStatus),
      default: ApplicationStatus.APPLIED,
    },
    coverLetter: { type: String, default: "" },
  },
  { timestamps: true },
);

// Unique: one application per seeker per job
jobApplicationSchema.index({ jobId: 1, seekerId: 1 }, { unique: true });
// Recruiter queries: list applications for a job by status
jobApplicationSchema.index({ jobId: 1, status: 1, createdAt: -1 });
// Seeker dashboard: my applications
jobApplicationSchema.index({ seekerId: 1, status: 1, createdAt: -1 });

export const JobApplication: Model<IJobApplication> =
  mongoose.models.JobApplication ||
  mongoose.model<IJobApplication>("JobApplication", jobApplicationSchema);

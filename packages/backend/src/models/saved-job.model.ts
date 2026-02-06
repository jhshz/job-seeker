import mongoose, { Schema, type Document, type Model } from "mongoose";

/**
 * SavedJob - Bookmark/save job for seeker.
 * Unique (seekerId, jobId).
 */
export interface ISavedJob extends Document {
  seekerId: mongoose.Types.ObjectId;
  jobId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const savedJobSchema = new Schema<ISavedJob>(
  {
    seekerId: {
      type: Schema.Types.ObjectId,
      ref: "SeekerProfile",
      required: true,
    },
    jobId: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
  },
  { timestamps: true },
);

savedJobSchema.index({ seekerId: 1, jobId: 1 }, { unique: true });
savedJobSchema.index({ seekerId: 1, createdAt: -1 });

export const SavedJob: Model<ISavedJob> =
  mongoose.models.SavedJob ||
  mongoose.model<ISavedJob>("SavedJob", savedJobSchema);

import mongoose, { Schema, type Document, type Model } from "mongoose";

/**
 * RecruiterProfile - Role-specific profile for recruiters/companies.
 * One-to-one with User (userId unique).
 *
 * Design: Separate from User for minimal PII in auth layer.
 */
export interface IRecruiterProfile extends Document {
  userId: mongoose.Types.ObjectId;
  companyName: string;
  companyDescription: string;
  website: string;
  logoFileId: mongoose.Types.ObjectId | null;
  location: string;
  industry: string;
  size: string;
  createdAt: Date;
  updatedAt: Date;
}

const recruiterProfileSchema = new Schema<IRecruiterProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    companyName: { type: String, required: true, trim: true },
    companyDescription: { type: String, default: "" },
    website: { type: String, default: "", trim: true },
    logoFileId: {
      type: Schema.Types.ObjectId,
      ref: "FileUpload",
      default: null,
    },
    location: { type: String, default: "", trim: true },
    industry: { type: String, default: "", trim: true },
    size: { type: String, default: "", trim: true },
  },
  { timestamps: true },
);

recruiterProfileSchema.index({ companyName: 1 });
recruiterProfileSchema.index({ location: 1 });

export const RecruiterProfile: Model<IRecruiterProfile> =
  mongoose.models.RecruiterProfile ||
  mongoose.model<IRecruiterProfile>("RecruiterProfile", recruiterProfileSchema);

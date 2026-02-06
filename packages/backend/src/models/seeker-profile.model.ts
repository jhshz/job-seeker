import mongoose, { Schema, type Document, type Model } from "mongoose";

/**
 * SeekerProfile - Role-specific profile for job seekers.
 * One-to-one with User (userId unique).
 *
 * Design: Separate from User (auth identity) for minimal PII in auth layer.
 */
export interface ISeekerProfile extends Document {
  userId: mongoose.Types.ObjectId;
  fullName: string;
  headline: string;
  location: string;
  about: string;
  skills: string[];
  /** Embedded education entries */
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    startYear: number;
    endYear: number | null;
    description?: string;
  }>;
  /** Embedded experience entries */
  experience: Array<{
    company: string;
    title: string;
    location?: string;
    startDate: Date;
    endDate: Date | null;
    current: boolean;
    description?: string;
  }>;
  avatarFileId: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const educationSchema = new Schema(
  {
    institution: { type: String, required: true },
    degree: { type: String, required: true },
    field: { type: String, default: "" },
    startYear: { type: Number, required: true },
    endYear: { type: Number, default: null },
    description: { type: String, default: "" },
  },
  { _id: false },
);

const experienceSchema = new Schema(
  {
    company: { type: String, required: true },
    title: { type: String, required: true },
    location: { type: String, default: "" },
    startDate: { type: Date, required: true },
    endDate: { type: Date, default: null },
    current: { type: Boolean, default: false },
    description: { type: String, default: "" },
  },
  { _id: false },
);

const seekerProfileSchema = new Schema<ISeekerProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    fullName: { type: String, required: true, trim: true },
    headline: { type: String, default: "", trim: true },
    location: { type: String, default: "", trim: true },
    about: { type: String, default: "" },
    skills: { type: [String], default: [] },
    education: { type: [educationSchema], default: [] },
    experience: { type: [experienceSchema], default: [] },
    avatarFileId: {
      type: Schema.Types.ObjectId,
      ref: "FileUpload",
      default: null,
    },
  },
  { timestamps: true },
);

seekerProfileSchema.index({ userId: 1 });
seekerProfileSchema.index({ skills: 1 });
seekerProfileSchema.index({ location: 1 });

export const SeekerProfile: Model<ISeekerProfile> =
  mongoose.models.SeekerProfile ||
  mongoose.model<ISeekerProfile>("SeekerProfile", seekerProfileSchema);

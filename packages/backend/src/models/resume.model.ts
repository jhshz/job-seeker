import mongoose, { Schema, type Document, type Model } from "mongoose";

/**
 * Resume - Resume document output from seeker wizard.
 * Belongs to SeekerProfile. Versioned with isActive flag.
 *
 * Design: Embedded sections (education, experience, skills) - resume is read/written
 * as a whole. Simpler than separate collections for <10 items per resume.
 * JobApplication stores resumeSnapshotId to preserve state at apply time.
 */
export interface IResume extends Document {
  seekerId: mongoose.Types.ObjectId;
  version: number;
  isActive: boolean;
  fullName: string;
  headline: string;
  location: string;
  about: string;
  skills: string[];
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    startYear: number;
    endYear: number | null;
    description?: string;
  }>;
  experience: Array<{
    company: string;
    title: string;
    location?: string;
    startDate: Date;
    endDate: Date | null;
    current: boolean;
    description?: string;
  }>;
  /** Reference to PDF if exported */
  fileId: mongoose.Types.ObjectId | null;
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

const resumeSchema = new Schema<IResume>(
  {
    seekerId: {
      type: Schema.Types.ObjectId,
      ref: "SeekerProfile",
      required: true,
    },
    version: { type: Number, required: true, default: 1 },
    isActive: { type: Boolean, default: true },
    fullName: { type: String, required: true, trim: true },
    headline: { type: String, default: "", trim: true },
    location: { type: String, default: "", trim: true },
    about: { type: String, default: "" },
    skills: { type: [String], default: [] },
    education: { type: [educationSchema], default: [] },
    experience: { type: [experienceSchema], default: [] },
    fileId: {
      type: Schema.Types.ObjectId,
      ref: "FileUpload",
      default: null,
    },
  },
  { timestamps: true },
);

resumeSchema.index({ seekerId: 1, isActive: 1 });
resumeSchema.index({ seekerId: 1, version: -1 });
resumeSchema.index({ seekerId: 1, createdAt: -1 });

export const Resume: Model<IResume> =
  mongoose.models.Resume || mongoose.model<IResume>("Resume", resumeSchema);

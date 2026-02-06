import mongoose, { Schema, type Document, type Model } from "mongoose";
import { FileKind } from "@enums";

/**
 * FileUpload - Metadata for uploaded files (avatar, logo, resume PDFs).
 *
 * Design: Separate collection - files can be referenced by multiple entities.
 * Actual file stored in external storage (S3, local); this stores metadata + storageKey.
 */
export interface IFileUpload extends Document {
  ownerId: mongoose.Types.ObjectId;
  kind: "avatar" | "logo" | "resume" | "other";
  storageKey: string;
  url: string;
  mime: string;
  size: number;
  checksum: string;
  originalName: string;
  createdAt: Date;
  updatedAt: Date;
}

const fileUploadSchema = new Schema<IFileUpload>(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    kind: {
      type: String,
      enum: Object.values(FileKind),
      required: true,
    },
    storageKey: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    mime: { type: String, required: true, trim: true },
    size: { type: Number, required: true },
    checksum: { type: String, default: "", trim: true },
    originalName: { type: String, default: "", trim: true },
  },
  { timestamps: true },
);

fileUploadSchema.index({ ownerId: 1, kind: 1 });
fileUploadSchema.index({ createdAt: -1 });
fileUploadSchema.index({ storageKey: 1 }, { unique: true });

export const FileUpload: Model<IFileUpload> =
  mongoose.models.FileUpload ||
  mongoose.model<IFileUpload>("FileUpload", fileUploadSchema);

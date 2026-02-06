import mongoose, { Schema, type Document, type Model } from "mongoose";

export type OtpPurpose = "login" | "register";

export interface IOtpRequest extends Document {
  phoneE164: string;
  purpose: OtpPurpose;
  codeHash: string;
  expiresAt: Date;
  attemptsLeft: number;
  resendAvailableAt: Date;
  requestIp: string;
  userAgent: string;
  usedAt: Date | null;
  createdAt: Date;
}

const otpRequestSchema = new Schema<IOtpRequest>(
  {
    phoneE164: {
      type: String,
      required: true,
      trim: true,
    },
    purpose: {
      type: String,
      enum: ["login", "register"],
      required: true,
    },
    codeHash: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 }, // TTL index
    },
    attemptsLeft: {
      type: Number,
      required: true,
      default: 5,
    },
    resendAvailableAt: {
      type: Date,
      required: true,
    },
    requestIp: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
      required: true,
    },
    usedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
otpRequestSchema.index({ phoneE164: 1, createdAt: -1 });
// Note: expiresAt already has index: { expireAfterSeconds: 0 } in the field definition, so we don't need to add it again
otpRequestSchema.index({ requestIp: 1, createdAt: -1 });

export const OtpRequest: Model<IOtpRequest> =
  mongoose.models.OtpRequest ||
  mongoose.model<IOtpRequest>("OtpRequest", otpRequestSchema);

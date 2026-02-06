import mongoose, { Schema, type Document, type Model } from "mongoose";
import { OtpPurpose, type OtpPurpose as OtpPurposeType } from "@enums";

// Re-export for consumers importing from @models (backward compat)
export { OtpPurpose };
export type { OtpPurposeType };

/**
 * OtpRequest - OTP login/register flow.
 *
 * Design decisions:
 * - Only codeHash stored (never raw OTP) - minimal PII/security
 * - TTL on expiresAt: MongoDB auto-removes expired docs
 * - verifiedUserId: optional link when OTP creates/verifies user (audit trail)
 * - Composite indexes support: latest active OTP by phone+purpose, rate-limiting, TTL cleanup
 */
export interface IOtpRequest extends Document {
  phoneE164: string;
  purpose: OtpPurposeType;
  codeHash: string;
  expiresAt: Date;
  attemptsLeft: number;
  resendAvailableAt: Date;
  requestIp: string;
  userAgent: string;
  usedAt: Date | null;
  /** Set when OTP is consumed and user is created/verified - for audit */
  verifiedUserId: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
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
      enum: Object.values(OtpPurpose),
      required: true,
    },
    codeHash: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
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
    verifiedUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true },
);

// TTL index: MongoDB removes expired OTPs
otpRequestSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 },
);

// Latest active OTP by phone + purpose (for verification and resend cooldown)
otpRequestSchema.index({ phoneE164: 1, purpose: 1, usedAt: 1, createdAt: -1 });
// Rate-limiting by IP
otpRequestSchema.index({ requestIp: 1, createdAt: -1 });
// Rate-limiting by phone
otpRequestSchema.index({ phoneE164: 1, createdAt: -1 });

export const OtpRequest: Model<IOtpRequest> =
  mongoose.models.OtpRequest ||
  mongoose.model<IOtpRequest>("OtpRequest", otpRequestSchema);

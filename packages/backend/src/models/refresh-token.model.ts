import mongoose, { Schema, type Document, type Model } from "mongoose";

/**
 * RefreshToken - Rotating refresh tokens for JWT auth.
 *
 * Design decisions:
 * - Only tokenHash stored (never raw token) - minimal PII/security
 * - TTL on expiresAt: MongoDB auto-removes expired docs
 * - revokedAt: soft revoke for rotation/ logout - keeps audit trail
 * - rotatedFrom: chain of rotations for token reuse detection
 * - ip, userAgent: audit and device fingerprinting
 */
export interface IRefreshToken extends Document {
  userId: mongoose.Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
  revokedAt: Date | null;
  ip: string;
  userAgent: string;
  rotatedFrom: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const refreshTokenSchema = new Schema<IRefreshToken>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    revokedAt: {
      type: Date,
      default: null,
    },
    ip: {
      type: String,
      required: true,
      default: "",
    },
    userAgent: {
      type: String,
      required: true,
      default: "",
    },
    rotatedFrom: {
      type: Schema.Types.ObjectId,
      ref: "RefreshToken",
      default: null,
    },
  },
  { timestamps: true },
);

// TTL index: MongoDB removes docs when expiresAt passes (expireAfterSeconds: 0)
refreshTokenSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 },
);

// Lookup by user + revoke status for "revoke all" and validation
refreshTokenSchema.index({ userId: 1, revokedAt: 1 });
// Token reuse detection via rotation chain
refreshTokenSchema.index({ rotatedFrom: 1 });

export const RefreshToken: Model<IRefreshToken> =
  mongoose.models.RefreshToken ||
  mongoose.model<IRefreshToken>("RefreshToken", refreshTokenSchema);

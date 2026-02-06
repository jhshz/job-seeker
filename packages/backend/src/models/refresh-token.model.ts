import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IRefreshToken extends Document {
  userId: mongoose.Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
  revokedAt: Date | null;
  ip: string;
  userAgent: string;
  rotatedFrom: mongoose.Types.ObjectId | null;
  createdAt: Date;
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
      index: { expireAfterSeconds: 0 }, // TTL index
    },
    revokedAt: {
      type: Date,
      default: null,
    },
    ip: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
      required: true,
    },
    rotatedFrom: {
      type: Schema.Types.ObjectId,
      ref: "RefreshToken",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
refreshTokenSchema.index({ userId: 1, revokedAt: 1 });
// Note: tokenHash already has unique: true which creates an index, so we don't need to add it again
// Note: expiresAt already has index: { expireAfterSeconds: 0 } in the field definition, so we don't need to add it again

export const RefreshToken: Model<IRefreshToken> =
  mongoose.models.RefreshToken ||
  mongoose.model<IRefreshToken>("RefreshToken", refreshTokenSchema);

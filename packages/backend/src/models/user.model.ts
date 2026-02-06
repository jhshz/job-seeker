import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IUser extends Document {
  phoneE164: string;
  passwordHash: string | null;
  isPhoneVerified: boolean;
  status: "active" | "inactive" | "suspended";
  lastLoginAt: Date | null;
  passwordVersion: number;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    phoneE164: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      default: null,
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
    passwordVersion: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
// Note: phoneE164 already has unique: true which creates an index, so we don't need to add it again
userSchema.index({ status: 1 });
userSchema.index({ isPhoneVerified: 1 });

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);

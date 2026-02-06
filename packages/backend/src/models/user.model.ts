import mongoose, { Schema, type Document, type Model } from "mongoose";
import { UserRole, UserStatus, type UserRole as UserRoleType, type UserStatus as UserStatusType } from "@enums";

/**
 * User - Auth identity only.
 * Separated from role-specific profiles (SeekerProfile, RecruiterProfile).
 *
 * Design decisions:
 * - roles[] allows dual persona (seeker + recruiter) - common in job platforms
 * - passwordHash nullable: OTP-only users may never set password
 * - loginDisabledUntil + failedLoginCount: brute-force protection for password login
 * - passwordVersion: invalidate tokens on password change
 */
export interface IUser extends Document {
  phoneE164: string;
  passwordHash: string | null;
  isPhoneVerified: boolean;
  status: UserStatusType;
  roles: UserRoleType[];
  lastLoginAt: Date | null;
  passwordVersion: number;
  /** Brute-force: lock account until this time (null = not locked) */
  loginDisabledUntil: Date | null;
  /** Reset on successful login */
  failedLoginCount: number;
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
      index: true,
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
      enum: Object.values(UserStatus),
      default: UserStatus.ACTIVE,
    },
    roles: {
      type: [String],
      enum: Object.values(UserRole),
      default: [],
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
    passwordVersion: {
      type: Number,
      default: 0,
    },
    loginDisabledUntil: {
      type: Date,
      default: null,
    },
    failedLoginCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

// Indexes: phoneE164 unique (schema), status, isPhoneVerified, roles for filtering
userSchema.index({ status: 1 });
userSchema.index({ isPhoneVerified: 1 });
userSchema.index({ roles: 1 });

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);

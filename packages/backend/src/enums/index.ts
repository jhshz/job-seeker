/**
 * Shared enums for consistent usage across the app.
 * Centralized to avoid magic strings and ensure type safety.
 */

/** User account status */
export const UserStatus = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  SUSPENDED: "suspended",
} as const;
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

/** User roles - a user can have one or both roles */
export const UserRole = {
  SEEKER: "seeker",
  RECRUITER: "recruiter",
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

/** OTP purpose for auth flows */
export const OtpPurpose = {
  LOGIN: "login",
  REGISTER: "register",
} as const;
export type OtpPurpose = (typeof OtpPurpose)[keyof typeof OtpPurpose];

/** Job status */
export const JobStatus = {
  DRAFT: "draft",
  PUBLISHED: "published",
  CLOSED: "closed",
} as const;
export type JobStatus = (typeof JobStatus)[keyof typeof JobStatus];

/** Job employment type */
export const JobType = {
  FULL_TIME: "full-time",
  PART_TIME: "part-time",
  CONTRACT: "contract",
  INTERNSHIP: "internship",
  FREELANCE: "freelance",
  REMOTE: "remote",
  HYBRID: "hybrid",
} as const;
export type JobType = (typeof JobType)[keyof typeof JobType];

/** Job application status pipeline */
export const ApplicationStatus = {
  APPLIED: "applied",
  REVIEWING: "reviewing",
  INTERVIEW: "interview",
  OFFERED: "offered",
  REJECTED: "rejected",
  WITHDRAWN: "withdrawn",
} as const;
export type ApplicationStatus =
  (typeof ApplicationStatus)[keyof typeof ApplicationStatus];

/** File upload kind */
export const FileKind = {
  AVATAR: "avatar",
  LOGO: "logo",
  RESUME: "resume",
  OTHER: "other",
} as const;
export type FileKind = (typeof FileKind)[keyof typeof FileKind];

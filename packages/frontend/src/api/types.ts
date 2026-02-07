export type Role = "seeker" | "recruiter";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: { code?: string; message: string; details?: unknown };
  meta?: Record<string, unknown>;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages?: number;
}

export interface User {
  id: string;
  phoneE164: string;
  isPhoneVerified: boolean;
  status: string;
  roles: Role[];
}

export interface SeekerProfile {
  id: string;
  userId: string;
  fullName?: string;
  headline?: string;
  location?: string;
  about?: string;
  skills?: string[];
  education?: EducationEntry[];
  experience?: ExperienceEntry[];
}

export interface EducationEntry {
  institution: string;
  degree: string;
  field?: string;
  startYear: number;
  endYear: number | null;
  description?: string;
}

export interface ExperienceEntry {
  company: string;
  title: string;
  location?: string;
  startDate: string;
  endDate: string | null;
  current?: boolean;
  description?: string;
}

export interface RecruiterProfile {
  id: string;
  userId: string;
  companyName?: string;
  companyDescription?: string;
  website?: string;
  location?: string;
  industry?: string;
  size?: string;
}

export interface Job {
  id: string;
  recruiterId: string;
  title: string;
  description: string;
  status: "draft" | "published" | "closed";
  type: string[];
  location: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency: string;
  salaryPeriod: string;
  showSalary: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface JobApplication {
  id: string;
  jobId: string;
  seekerId: string;
  resumeId: string;
  status: string;
  coverLetter?: string;
  createdAt: string;
}

export interface Resume {
  id: string;
  seekerId: string;
  fullName: string;
  headline?: string;
  location?: string;
  about?: string;
  skills?: string[];
  education?: EducationEntry[];
  experience?: ExperienceEntry[];
  isActive?: boolean;
  createdAt: string;
}

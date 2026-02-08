import { api } from "./axios";
import { endpoints } from "./endpoints";
import type { Job, JobApplication, RecruiterProfile } from "./types";

export type UpdateRecruiterProfilePayload = Partial<
  Pick<RecruiterProfile, "companyName" | "companyDescription" | "website" | "location" | "industry" | "size">
> & { logoFileId?: string | null };

export type RecruiterPublic = {
  recruiter: { id: string; companyName?: string; companyDescription?: string; [key: string]: unknown };
  jobs?: Job[];
};

export async function getRecruiterProfile() {
  const { data } = await api.get<{ success: boolean; data: RecruiterProfile }>(
    endpoints.recruiters.me,
  );
  return data.data;
}

export async function updateRecruiterProfile(payload: UpdateRecruiterProfilePayload) {
  const { data } = await api.patch<{ success: boolean; data: RecruiterProfile }>(
    endpoints.recruiters.me,
    payload,
  );
  return data.data;
}

export async function getRecruiterPublic(recruiterId: string) {
  const { data } = await api.get<{ success: boolean; data: RecruiterPublic }>(
    endpoints.recruiters.public(recruiterId),
  );
  return data.data;
}

export async function listRecruiterJobs() {
  // Note: When used as React Query queryFn, it receives QueryFunctionContext as first arg - we ignore it
  // and only send valid API params to avoid 400 from backend validation
  const { data } = await api.get<{ success: boolean; data: Job[] }>(
    endpoints.recruiters.jobs,
    { params: { limit: 100 } },
  );
  return data.data;
}

export type CreateJobPayload = {
  title: string;
  description: string;
  status?: "draft" | "published" | "closed";
  type?: string[];
  location?: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string;
  salaryPeriod?: string;
  showSalary?: boolean;
  tags?: string[];
};

export async function createJob(payload: CreateJobPayload) {
  const { data } = await api.post<{ success: boolean; data: Job }>(
    endpoints.recruiters.jobs,
    payload,
  );
  return data.data;
}

export async function updateJob(jobId: string, payload: Partial<CreateJobPayload>) {
  const { data } = await api.patch<{ success: boolean; data: Job }>(
    endpoints.recruiters.jobDetail(jobId),
    payload,
  );
  return data.data;
}

export type ListApplicationsParams = {
  page?: number;
  limit?: number;
  status?: string;
};

export async function getJobApplications(
  jobId: string,
  params?: ListApplicationsParams,
) {
  const { data } = await api.get<{
    success: boolean;
    data: JobApplication[];
    meta?: unknown;
  }>(endpoints.recruiters.jobApplications(jobId), {
    params: { limit: 100, ...params },
  });
  return { applications: data.data, meta: data.meta };
}

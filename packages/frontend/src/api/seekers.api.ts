import { api } from "./axios";
import { endpoints } from "./endpoints";
import type { JobApplication, Resume, SeekerProfile } from "./types";

export type UpdateSeekerProfilePayload = Partial<
  Pick<SeekerProfile, "fullName" | "headline" | "location" | "about" | "skills" | "education" | "experience">
> & { avatarFileId?: string | null };

export type ListApplicationsParams = {
  page?: number;
  limit?: number;
  status?: string;
};

export async function updateSeekerProfile(payload: UpdateSeekerProfilePayload) {
  const { data } = await api.patch<{ success: boolean; data: SeekerProfile }>(
    endpoints.seekers.me,
    payload,
  );
  return data.data;
}

export async function getMyApplications(params?: ListApplicationsParams) {
  const { data } = await api.get<{
    success: boolean;
    data: JobApplication[];
    meta?: unknown;
  }>(endpoints.seekers.applications, { params });
  return { applications: data.data, meta: data.meta };
}

export async function getMyResumes() {
  const { data } = await api.get<{ success: boolean; data: Resume[] }>(
    endpoints.seekers.resumes,
  );
  return data.data;
}

export type CreateResumePayload = {
  fullName: string;
  headline?: string;
  location?: string;
  about?: string;
  skills?: string[];
  education?: unknown[];
  experience?: unknown[];
};

export async function createResume(payload: CreateResumePayload) {
  const { data } = await api.post<{ success: boolean; data: Resume }>(
    endpoints.seekers.resumes,
    payload,
  );
  return data.data;
}

export async function activateResume(resumeId: string) {
  const { data } = await api.patch<{ success: boolean; data: Resume }>(
    endpoints.seekers.activateResume(resumeId),
  );
  return data.data;
}

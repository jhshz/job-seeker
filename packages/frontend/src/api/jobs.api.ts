import { api } from "./axios";
import { endpoints } from "./endpoints";
import type { Job } from "./types";

export type ListJobsParams = {
  page?: number;
  limit?: number;
  q?: string;
  location?: string;
  type?: string;
  tags?: string;
  status?: string;
};

export type JobsListResponse = {
  data: Job[];
  meta?: { page: number; limit: number; total: number; totalPages?: number };
};

export async function listJobs(params?: ListJobsParams) {
  const { data } = await api.get<{ success: boolean; data: Job[]; meta?: unknown }>(
    endpoints.jobs.list,
    { params },
  );
  return { jobs: data.data, meta: data.meta };
}

export async function getJobById(id: string) {
  const { data } = await api.get<{ success: boolean; data: Job }>(
    endpoints.jobs.detail(id),
  );
  return data.data;
}

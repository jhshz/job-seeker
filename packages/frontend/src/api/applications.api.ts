import { api } from "./axios";
import { endpoints } from "./endpoints";

export type ApplyToJobPayload = {
  resumeId: string;
  coverLetter?: string;
};

export async function applyToJob(jobId: string, payload: ApplyToJobPayload) {
  const { data } = await api.post(endpoints.jobs.apply(jobId), payload);
  return data;
}

export const queryKeys = {
  auth: { me: ["auth", "me"] as const },
  jobs: {
    all: (params?: Record<string, unknown>) => ["jobs", params ?? {}] as const,
    detail: (id: string) => ["jobs", id] as const,
  },
  recruiters: {
    me: ["recruiters", "me"] as const,
    public: (id: string) => ["recruiters", "public", id] as const,
    jobs: ["recruiters", "jobs"] as const,
    jobDetail: (jobId: string) => ["recruiters", "jobs", jobId] as const,
    jobApplications: (jobId: string, params?: Record<string, unknown>) =>
      ["recruiters", "jobs", jobId, "applications", params ?? {}] as const,
  },
  seekers: {
    applications: (params?: Record<string, unknown>) =>
      ["seekers", "applications", params ?? {}] as const,
    resumes: ["seekers", "resumes"] as const,
  },
} as const;

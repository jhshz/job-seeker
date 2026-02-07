const API_PREFIX = "/api";

export const endpoints = {
  auth: {
    otpRequest: `${API_PREFIX}/auth/otp/request`,
    otpVerify: `${API_PREFIX}/auth/otp/verify`,
    login: `${API_PREFIX}/auth/login`,
    refresh: `${API_PREFIX}/auth/refresh`,
    logout: `${API_PREFIX}/auth/logout`,
    me: `${API_PREFIX}/auth/me`,
  },
  jobs: {
    list: `${API_PREFIX}/jobs`,
    detail: (id: string) => `${API_PREFIX}/jobs/${id}`,
    apply: (id: string) => `${API_PREFIX}/jobs/${id}/apply`,
  },
  recruiters: {
    me: `${API_PREFIX}/recruiters/me`,
    public: (id: string) => `${API_PREFIX}/recruiters/${id}`,
    jobs: `${API_PREFIX}/recruiters/jobs`,
    jobDetail: (jobId: string) => `${API_PREFIX}/recruiters/jobs/${jobId}`,
    jobApplications: (jobId: string) =>
      `${API_PREFIX}/recruiters/jobs/${jobId}/applications`,
  },
  seekers: {
    me: `${API_PREFIX}/seekers/me`,
    applications: `${API_PREFIX}/seekers/me/applications`,
    resumes: `${API_PREFIX}/seekers/me/resumes`,
    activateResume: (resumeId: string) =>
      `${API_PREFIX}/seekers/me/resumes/${resumeId}/activate`,
  },
} as const;

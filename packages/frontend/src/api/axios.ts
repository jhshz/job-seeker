import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/stores/auth.store";
import { endpoints } from "./endpoints";

const baseURL =
  import.meta.env.VITE_API_BASE_URL?.toString()?.replace(/\/$/, "") ||
  "http://localhost:3000";

export const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function processQueue(token: string | null, err: unknown) {
  failedQueue.forEach((prom) => (token ? prom.resolve(token) : prom.reject(err)));
  failedQueue = [];
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    const originalRequest = err.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (err.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(err);
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch((e) => Promise.reject(e));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    return api
      .post(endpoints.auth.refresh, {})
      .then((res) => {
        const { accessToken } = res.data?.data ?? res.data ?? {};
        if (accessToken) {
          useAuthStore.getState().setAccessToken(accessToken);
          processQueue(accessToken, null);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
        throw new Error("No access token in refresh response");
      })
      .catch((refreshErr) => {
        processQueue(null, refreshErr);
        useAuthStore.getState().clearAuth();
        window.location.href = "/auth/login";
        return Promise.reject(refreshErr);
      })
      .finally(() => {
        isRefreshing = false;
      });
  },
);

export function getApiErrorMessage(error: unknown): string {
  const err = error as AxiosError<{ error?: { message?: string }; message?: string }>;
  const data = err.response?.data;
  return data?.error?.message ?? data?.message ?? err.message ?? "خطایی رخ داد";
}

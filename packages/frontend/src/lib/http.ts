import axios, { type AxiosError } from "axios";
import { useAuthStore } from "@/stores/auth.store";

const baseURL = import.meta.env.VITE_API_BASE_URL?.toString() || "http://localhost:3000/api";

export const http = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

http.interceptors.request.use(config => {
  const token = useAuthStore.getState().tokens?.accessToken;
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getApiErrorMessage = (error: unknown): string => {
  const err = error as AxiosError<{ message?: string }>;
  return err.response?.data?.message || err.message || "خطایی رخ داد";
};

import { api } from "./axios";
import { endpoints } from "./endpoints";
import type { User } from "./types";

export type OtpPurpose = "login" | "register";

export type OtpRequestPayload = { phoneE164: string; purpose: OtpPurpose };
export type OtpRequestResponse = { requestId: string; message: string; expiresAt: string };

export type OtpVerifyPayload = {
  phoneE164: string;
  purpose: OtpPurpose;
  code: string;
  /** Role for new user when purpose is "register" */
  role?: "seeker" | "recruiter";
  /** Full name for seeker when purpose is "register" and role is "seeker" */
  fullName?: string;
};
export type AuthPayload = { user: User; accessToken: string };

export type PasswordLoginPayload = { phoneE164: string; password: string };

export async function requestOtp(payload: OtpRequestPayload) {
  const { data } = await api.post<{ success: boolean; data: OtpRequestResponse }>(
    endpoints.auth.otpRequest,
    payload,
  );
  return data.data;
}

export async function verifyOtp(payload: OtpVerifyPayload) {
  const { data } = await api.post<{ success: boolean; data: AuthPayload }>(
    endpoints.auth.otpVerify,
    payload,
  );
  return data.data;
}

export async function loginPassword(payload: PasswordLoginPayload) {
  const { data } = await api.post<{ success: boolean; data: AuthPayload }>(
    endpoints.auth.login,
    payload,
  );
  return data.data;
}

export async function setPassword(newPassword: string) {
  await api.post(endpoints.auth.setPassword, { newPassword });
}

export async function logout() {
  await api.post(endpoints.auth.logout, {});
}

export async function getMe(): Promise<User & { seekerProfile?: unknown; recruiterProfile?: unknown }> {
  const { data } = await api.get<{ success: boolean; data: User }>(endpoints.auth.me);
  return data.data;
}

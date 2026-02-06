import { http } from "@/lib/http";
import type { AuthResponse } from "@/stores/auth.store";

export type OtpPurpose = "login" | "register";

export type OtpRequestPayload = {
  phone: string;
  purpose: OtpPurpose;
};

export type OtpRequestResponse = {
  requestId: string;
  message: string;
  expiresAt: string;
};

export async function requestOtp(payload: OtpRequestPayload) {
  const { data } = await http.post<OtpRequestResponse>("/auth/otp/request", payload);
  return data;
}

export type OtpVerifyPayload = {
  requestId: string;
  code: string;
};

export async function verifyOtp(payload: OtpVerifyPayload) {
  const { data } = await http.post<AuthResponse>("/auth/otp/verify", payload);
  return data;
}

export type PasswordLoginPayload = {
  phone: string;
  password: string;
};

export async function passwordLogin(payload: PasswordLoginPayload) {
  const { data } = await http.post<AuthResponse>("/auth/password/login", payload);
  return data;
}

export type SetPasswordPayload = {
  newPassword: string;
};

export async function setPassword(payload: SetPasswordPayload) {
  const { data } = await http.post<{ message: string }>("/auth/password/set", payload);
  return data;
}


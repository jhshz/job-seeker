/**
 * Authentication-related types
 */

export type OtpPurpose = "login" | "register";

export interface OtpRequestPayload {
  phone: string;
  purpose: OtpPurpose;
}

export interface OtpVerifyPayload {
  requestId: string;
  code: string;
}

export interface PasswordLoginPayload {
  phone: string;
  password: string;
}

export interface SetPasswordPayload {
  newPassword: string;
}

export interface RefreshTokenPayload {
  refreshToken: string;
}

export interface LogoutPayload {
  refreshToken: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: {
    id: string;
    phoneE164: string;
    isPhoneVerified: boolean;
    status: string;
  };
  tokens: AuthTokens;
}

export interface OtpRequestResponse {
  requestId: string;
  message: string;
  expiresAt: Date;
}

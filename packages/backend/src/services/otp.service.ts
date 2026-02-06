import crypto from "crypto";
import { config } from "@configs";
import { OtpRequest, type OtpPurposeType } from "@models";
import { hashOtpCode, verifyOtpCode } from "@utils";
import { smsProvider } from "./sms.service";
import { AppError } from "@middlewares";

export interface CreateOtpRequestParams {
  phoneE164: string;
  purpose: OtpPurposeType;
  requestIp: string;
  userAgent: string;
}

export interface VerifyOtpParams {
  requestId: string;
  code: string;
}

/**
 * Generates a 6-digit OTP code
 */
function generateOtpCode(): string {
  return crypto.randomInt(100000, 999999).toString();
}

/**
 * OTP Service
 */
export class OtpService {
  /**
   * Creates a new OTP request and sends SMS
   */
  async createOtpRequest(
    params: CreateOtpRequestParams,
  ): Promise<{ requestId: string; expiresAt: Date }> {
    const { phoneE164, purpose, requestIp, userAgent } = params;

    // Check for recent request (resend cooldown)
    const recentRequest = await OtpRequest.findOne({
      phoneE164,
      createdAt: { $gte: new Date(Date.now() - config.OTP_RESEND_COOLDOWN_SECONDS * 1000) },
      usedAt: null,
    }).sort({ createdAt: -1 });

    if (recentRequest) {
      const secondsLeft = Math.ceil(
        (config.OTP_RESEND_COOLDOWN_SECONDS * 1000 -
          (Date.now() - recentRequest.createdAt.getTime())) /
          1000,
      );
      throw new AppError(
        `Please wait ${secondsLeft} seconds before requesting a new OTP`,
        429,
      );
    }

    // Generate OTP code
    const code = generateOtpCode();
    const codeHash = hashOtpCode(code);

    // Calculate expiry (2-5 minutes)
    const expiryMinutes = Math.floor(Math.random() * 4) + 2; // Random between 2-5
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    // Calculate resend cooldown
    const resendAvailableAt = new Date(
      Date.now() + config.OTP_RESEND_COOLDOWN_SECONDS * 1000,
    );

    // Create OTP request
    const otpRequest = await OtpRequest.create({
      phoneE164,
      purpose,
      codeHash,
      expiresAt,
      attemptsLeft: config.OTP_MAX_ATTEMPTS,
      resendAvailableAt,
      requestIp,
      userAgent,
    });

    // Send SMS (non-blocking)
    smsProvider.sendOtp(phoneE164, code).catch((error) => {
      console.error("Failed to send OTP SMS:", error);
      // Don't throw - OTP is already saved, user can retry verification
    });

    return {
      requestId: otpRequest._id.toString(),
      expiresAt,
    };
  }

  /**
   * Verifies an OTP code
   */
  async verifyOtp(params: VerifyOtpParams): Promise<{
    phoneE164: string;
    purpose: OtpPurposeType;
  }> {
    const { requestId, code } = params;

    const otpRequest = await OtpRequest.findById(requestId);

    if (!otpRequest) {
      throw new AppError("Invalid OTP request", 400);
    }

    // Check if already used
    if (otpRequest.usedAt) {
      throw new AppError("OTP has already been used", 400);
    }

    // Check if expired
    if (new Date() > otpRequest.expiresAt) {
      throw new AppError("OTP has expired", 400);
    }

    // Check attempts
    if (otpRequest.attemptsLeft <= 0) {
      throw new AppError("Maximum verification attempts exceeded", 429);
    }

    // Verify code
    const isValid = verifyOtpCode(code, otpRequest.codeHash);

    // Decrement attempts
    otpRequest.attemptsLeft -= 1;
    await otpRequest.save();

    if (!isValid) {
      if (otpRequest.attemptsLeft <= 0) {
        throw new AppError("Invalid OTP code. Maximum attempts exceeded", 400);
      }
      throw new AppError(
        `Invalid OTP code. ${otpRequest.attemptsLeft} attempts remaining`,
        400,
      );
    }

    // Mark as used
    otpRequest.usedAt = new Date();
    await otpRequest.save();

    return {
      phoneE164: otpRequest.phoneE164,
      purpose: otpRequest.purpose,
    };
  }
}

export const otpService = new OtpService();

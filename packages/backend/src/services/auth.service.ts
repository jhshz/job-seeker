import { User, type IUser } from "@models";
import { UserRole } from "@enums";
import { otpService } from "./otp.service";
import { tokenService } from "./token.service";
import { seekerService } from "./seeker.service";
import { recruiterService } from "./recruiter.service";
import { hashPassword, verifyPassword } from "@utils";
import { AppError } from "@middlewares";

export interface CreateUserParams {
  phoneE164: string;
}

export interface PasswordLoginParams {
  phoneE164: string;
  password: string;
}

export interface SetPasswordParams {
  userId: string;
  currentPassword?: string;
  newPassword: string;
}

export interface ResetPasswordByOtpParams {
  phoneE164: string;
  code: string;
  newPassword: string;
}

/**
 * Auth Service
 */
export class AuthService {
  /**
   * Creates a new user or returns existing user
   */
  async createOrGetUser(params: CreateUserParams): Promise<IUser> {
    const { phoneE164 } = params;

    let user = await User.findOne({ phoneE164 });

    if (!user) {
      user = await User.create({
        phoneE164,
        isPhoneVerified: false,
        status: "active",
        passwordVersion: 0,
      });
    }

    return user;
  }

  /**
   * Verifies OTP by phoneE164 + purpose + code, then create/update user and return tokens.
   * For register purpose, optional role creates the user with that role and the corresponding profile.
   */
  async verifyOtpAndLogin(
    phoneE164: string,
    purpose: string,
    code: string,
    ip: string,
    userAgent: string,
    role?: "seeker" | "recruiter",
    fullName?: string,
    companyName?: string,
  ) {
    const { phoneE164: verifiedPhone } = await otpService.verifyOtpByPhonePurposeCode(
      phoneE164,
      purpose as "login" | "register",
      code,
    );

    const isRegister = purpose === "register";
    const effectiveRole =
      isRegister && role && (role === "seeker" || role === "recruiter") ? role : null;

    let user = await User.findOne({ phoneE164: verifiedPhone });
    if (!user) {
      user = await User.create({
        phoneE164: verifiedPhone,
        isPhoneVerified: true,
        status: "active",
        passwordVersion: 0,
        roles: effectiveRole ? [effectiveRole === "seeker" ? UserRole.SEEKER : UserRole.RECRUITER] : [],
      });
      if (effectiveRole === "seeker") {
        await seekerService.getOrCreateProfile(user._id.toString(), {
          fullName: fullName?.trim() || "",
        });
      } else if (effectiveRole === "recruiter") {
        await recruiterService.getOrCreateProfile(user._id.toString(), {
          companyName: companyName?.trim() || "شرکت",
        });
      }
    } else {
      user.isPhoneVerified = true;
      user.lastLoginAt = new Date();
      await user.save();
    }

    const tokens = await tokenService.generateTokens(user, ip, userAgent);
    return {
      user: {
        id: user._id.toString(),
        phoneE164: user.phoneE164,
        isPhoneVerified: user.isPhoneVerified,
        status: user.status,
        roles: user.roles,
      },
      tokens,
    };
  }

  /**
   * Login with phoneE164 and password
   */
  async passwordLogin(
    params: PasswordLoginParams,
    ip: string,
    userAgent: string,
  ) {
    const { phoneE164, password } = params;

    const user = await User.findOne({ phoneE164 });

    if (!user) {
      throw new AppError("Invalid phone or password", 401);
    }

    // Check if password is set
    if (!user.passwordHash) {
      throw new AppError("Password not set for this account", 409, false);
    }

    const isValidPassword = await verifyPassword(password, user.passwordHash);

    if (!isValidPassword) {
      throw new AppError("Invalid phone or password", 401);
    }

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    // Generate tokens
    const tokens = await tokenService.generateTokens(user, ip, userAgent);

    return {
      user: {
        id: user._id.toString(),
        phoneE164: user.phoneE164,
        isPhoneVerified: user.isPhoneVerified,
        status: user.status,
        roles: user.roles,
      },
      tokens,
    };
  }

  /**
   * Sets password for user (requires authentication).
   * If user already has a password, currentPassword must be provided and match.
   */
  async setPassword(params: SetPasswordParams): Promise<void> {
    const { userId, currentPassword, newPassword } = params;

    const user = await User.findById(userId);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (user.passwordHash) {
      if (!currentPassword) {
        throw new AppError("Current password is required", 400, false, "CURRENT_PASSWORD_REQUIRED");
      }
      const isValid = await verifyPassword(currentPassword, user.passwordHash);
      if (!isValid) {
        throw new AppError("Current password is incorrect", 401, false, "INVALID_CURRENT_PASSWORD");
      }
    }

    const passwordHash = await hashPassword(newPassword);

    user.passwordHash = passwordHash;
    user.passwordVersion += 1;
    await user.save();

    await tokenService.revokeAllUserTokens(userId);
  }

  /**
   * Resets password by verifying OTP (phone + code). No auth required.
   */
  async resetPasswordByOtp(params: ResetPasswordByOtpParams): Promise<void> {
    const { phoneE164, code, newPassword } = params;

    const { phoneE164: verifiedPhone } = await otpService.verifyOtpByPhonePurposeCode(
      phoneE164,
      "reset_password",
      code,
    );

    const user = await User.findOne({ phoneE164: verifiedPhone });
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const passwordHash = await hashPassword(newPassword);
    user.passwordHash = passwordHash;
    user.passwordVersion += 1;
    await user.save();

    await tokenService.revokeAllUserTokens(user._id.toString());
  }

  /**
   * Gets current user by ID
   */
  async getCurrentUser(userId: string) {
    const user = await User.findById(userId);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    return {
      id: user._id.toString(),
      phoneE164: user.phoneE164,
      isPhoneVerified: user.isPhoneVerified,
      status: user.status,
      roles: user.roles,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

export const authService = new AuthService();

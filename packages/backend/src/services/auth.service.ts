import { User, type IUser } from "@models";
import { otpService } from "./otp.service";
import { tokenService } from "./token.service";
import { hashPassword, verifyPassword } from "@utils";
import { AppError } from "@middlewares";

export interface PasswordLoginParams {
  phoneE164: string;
  password: string;
}

export interface SetPasswordParams {
  userId: string;
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
   * Verifies OTP by phoneE164 + purpose + code, then create/update user and return tokens
   */
  async verifyOtpAndLogin(
    phoneE164: string,
    purpose: string,
    code: string,
    ip: string,
    userAgent: string,
  ) {
    const { phoneE164: verifiedPhone } = await otpService.verifyOtpByPhonePurposeCode(
      phoneE164,
      purpose as "login" | "register",
      code,
    );

    let user = await User.findOne({ phoneE164: verifiedPhone });
    if (!user) {
      user = await User.create({
        phoneE164: verifiedPhone,
        isPhoneVerified: true,
        status: "active",
        passwordVersion: 0,
      });
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
   * Sets password for user (requires authentication)
   */
  async setPassword(params: SetPasswordParams): Promise<void> {
    const { userId, newPassword } = params;

    const user = await User.findById(userId);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const passwordHash = await hashPassword(newPassword);

    // Update user
    user.passwordHash = passwordHash;
    user.passwordVersion += 1;
    await user.save();

    // Revoke all existing refresh tokens (force re-login)
    await tokenService.revokeAllUserTokens(userId);
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
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

export const authService = new AuthService();

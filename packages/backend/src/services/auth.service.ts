import bcrypt from "bcryptjs";
import { User, type IUser } from "@models";
import { normalizeIranPhoneToE164 } from "@utils";
import { otpService } from "./otp.service";
import { tokenService } from "./token.service";
import { AppError } from "@middlewares";

export interface CreateUserParams {
  phoneE164: string;
}

export interface PasswordLoginParams {
  phone: string;
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
   * Verifies OTP and creates/updates user
   */
  async verifyOtpAndLogin(
    requestId: string,
    code: string,
    ip: string,
    userAgent: string,
  ) {
    // Verify OTP
    const { phoneE164 } = await otpService.verifyOtp({ requestId, code });

    // Get or create user
    let user = await User.findOne({ phoneE164 });

    if (!user) {
      user = await User.create({
        phoneE164,
        isPhoneVerified: true,
        status: "active",
        passwordVersion: 0,
      });
    } else {
      // Update user
      user.isPhoneVerified = true;
      user.lastLoginAt = new Date();
      await user.save();
    }

    // Generate tokens
    const tokens = await tokenService.generateTokens(user, ip, userAgent);

    return {
      user: {
        id: user._id.toString(),
        phoneE164: user.phoneE164,
        isPhoneVerified: user.isPhoneVerified,
        status: user.status,
      },
      tokens,
    };
  }

  /**
   * Login with phone and password
   */
  async passwordLogin(
    params: PasswordLoginParams,
    ip: string,
    userAgent: string,
  ) {
    const { phone, password } = params;

    // Normalize phone
    const phoneE164 = normalizeIranPhoneToE164(phone);

    // Find user
    const user = await User.findOne({ phoneE164 });

    if (!user) {
      throw new AppError("Invalid phone or password", 401);
    }

    // Check if password is set
    if (!user.passwordHash) {
      throw new AppError("Password not set for this account", 409, false);
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

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

    // Hash password
    const passwordHash = await bcrypt.hash(newPassword, 12);

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

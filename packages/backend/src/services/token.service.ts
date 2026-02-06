import jwt, { type SignOptions } from "jsonwebtoken";
import { config } from "@configs";
import { RefreshToken, type IUser, type IRefreshToken } from "@models";
import {
  generateRefreshToken,
  hashRefreshToken,
} from "@utils";
import { AppError } from "@middlewares";

export interface TokenPayload {
  userId: string;
  phoneE164: string;
  passwordVersion: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * Token Service
 */
export class TokenService {
  /**
   * Generates access token (JWT)
   */
  generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(
      payload,
      config.ACCESS_TOKEN_SECRET,
      {
        expiresIn: config.ACCESS_TOKEN_EXPIRY,
      } as SignOptions,
    );
  }

  /**
   * Verifies access token
   */
  verifyAccessToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, config.ACCESS_TOKEN_SECRET) as TokenPayload;
    } catch {
      throw new AppError("Invalid or expired access token", 401);
    }
  }

  /**
   * Generates refresh token and stores it in DB
   */
  async generateRefreshToken(
    user: IUser,
    ip: string,
    userAgent: string,
  ): Promise<string> {
    const token = generateRefreshToken();
    const tokenHash = hashRefreshToken(token);

    // Random TTL between min and max days
    const ttlDays =
      Math.floor(
        Math.random() *
          (config.REFRESH_TOKEN_MAX_TTL_DAYS -
            config.REFRESH_TOKEN_MIN_TTL_DAYS + 1),
      ) + config.REFRESH_TOKEN_MIN_TTL_DAYS;

    const expiresAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000);

    await RefreshToken.create({
      userId: user._id,
      tokenHash,
      expiresAt,
      ip,
      userAgent,
    });

    return token;
  }

  /**
   * Verifies refresh token and returns the token document
   */
  async verifyRefreshToken(token: string): Promise<IRefreshToken> {
    const tokenHash = hashRefreshToken(token);

    const refreshTokenDoc = await RefreshToken.findOne({
      tokenHash,
      revokedAt: null,
    });

    if (!refreshTokenDoc) {
      throw new AppError("Invalid refresh token", 401);
    }

    if (new Date() > refreshTokenDoc.expiresAt) {
      throw new AppError("Refresh token has expired", 401);
    }

    return refreshTokenDoc;
  }

  /**
   * Rotates refresh token (invalidates old, creates new)
   */
  async rotateRefreshToken(
    oldToken: string,
    user: IUser,
    ip: string,
    userAgent: string,
  ): Promise<string> {
    const oldTokenDoc = await this.verifyRefreshToken(oldToken);

    // Revoke old token
    oldTokenDoc.revokedAt = new Date();
    await oldTokenDoc.save();

    // Generate new token
    const newToken = await this.generateRefreshToken(user, ip, userAgent);

    // Link rotation
    const newTokenHash = hashRefreshToken(newToken);
    const newTokenDoc = await RefreshToken.findOne({ tokenHash: newTokenHash });
    if (newTokenDoc) {
      newTokenDoc.rotatedFrom = oldTokenDoc._id;
      await newTokenDoc.save();
    }

    return newToken;
  }

  /**
   * Revokes a refresh token
   */
  async revokeRefreshToken(token: string): Promise<void> {
    const tokenHash = hashRefreshToken(token);
    const refreshTokenDoc = await RefreshToken.findOne({
      tokenHash,
      revokedAt: null,
    });

    if (refreshTokenDoc) {
      refreshTokenDoc.revokedAt = new Date();
      await refreshTokenDoc.save();
    }
  }

  /**
   * Revokes all refresh tokens for a user
   */
  async revokeAllUserTokens(userId: string): Promise<void> {
    await RefreshToken.updateMany(
      {
        userId,
        revokedAt: null,
      },
      {
        $set: { revokedAt: new Date() },
      },
    );
  }

  /**
   * Generates both access and refresh tokens
   */
  async generateTokens(
    user: IUser,
    ip: string,
    userAgent: string,
  ): Promise<AuthTokens> {
    const accessToken = this.generateAccessToken({
      userId: user._id.toString(),
      phoneE164: user.phoneE164,
      passwordVersion: user.passwordVersion,
    });

    const refreshToken = await this.generateRefreshToken(user, ip, userAgent);

    return {
      accessToken,
      refreshToken,
    };
  }
}

export const tokenService = new TokenService();

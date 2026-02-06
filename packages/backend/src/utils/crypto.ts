import crypto from "crypto";

/**
 * Crypto utilities for hashing sensitive data
 */

/**
 * Hashes an OTP code using SHA-256
 * @param code - Plain OTP code (6 digits)
 * @returns Hashed code
 */
export function hashOtpCode(code: string): string {
  return crypto.createHash("sha256").update(code).digest("hex");
}

/**
 * Verifies an OTP code against its hash
 * @param code - Plain OTP code to verify
 * @param hash - Stored hash
 * @returns true if code matches hash
 */
export function verifyOtpCode(code: string, hash: string): boolean {
  const codeHash = hashOtpCode(code);
  return crypto.timingSafeEqual(
    Buffer.from(codeHash),
    Buffer.from(hash),
  );
}

/**
 * Generates a random refresh token
 * @returns Random token string
 */
export function generateRefreshToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Hashes a refresh token using SHA-256
 * @param token - Plain refresh token
 * @returns Hashed token
 */
export function hashRefreshToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Verifies a refresh token against its hash
 * @param token - Plain refresh token to verify
 * @param hash - Stored hash
 * @returns true if token matches hash
 */
export function verifyRefreshToken(token: string, hash: string): boolean {
  const tokenHash = hashRefreshToken(token);
  return crypto.timingSafeEqual(
    Buffer.from(tokenHash),
    Buffer.from(hash),
  );
}

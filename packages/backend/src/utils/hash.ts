// packages/backend/src/utils/hash.ts
import bcrypt from "bcryptjs";
import { hashOtpCode, verifyOtpCode } from "./crypto";

const SALT_ROUNDS = 12;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export { hashOtpCode, verifyOtpCode };

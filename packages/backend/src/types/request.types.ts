// packages/backend/src/types/request.types.ts
import type { UserRole } from "@enums";

export type Role = UserRole;

export interface RequestUser {
  id: string;
  phoneE164: string;
  passwordVersion: number;
  roles: Role[];
}

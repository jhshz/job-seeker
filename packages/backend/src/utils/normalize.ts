// packages/backend/src/utils/normalize.ts
import { normalizeIranPhoneToE164 } from "./phone";

/**
 * Normalize phone to E.164. Placeholder for multi-region; currently Iranian.
 */
export function normalizePhoneE164(input: string): string {
  return normalizeIranPhoneToE164(input);
}

/**
 * Phone normalization utilities for Iranian phone numbers
 * Converts various formats to E.164 format: +98XXXXXXXXXX
 */

/**
 * Normalizes Iranian phone number to E.164 format (+98XXXXXXXXXX)
 * @param input - Raw phone input in various formats
 * @returns Normalized E.164 phone number
 * @throws Error if phone cannot be normalized
 */
export function normalizeIranPhoneToE164(input: string): string {
  if (!input || typeof input !== "string") {
    throw new Error("Invalid phone input");
  }

  // Trim and remove spaces/dashes
  let normalized = input.trim().replace(/[\s-]/g, "");

  // Convert leading 0098 -> +98
  if (normalized.startsWith("0098")) {
    normalized = "+98" + normalized.slice(4);
  }
  // Convert leading 98 -> +98 (if not already +98)
  else if (normalized.startsWith("98") && !normalized.startsWith("+98")) {
    normalized = "+98" + normalized.slice(2);
  }
  // Convert leading 0 + 9xxxxxxxxx -> +98 + 9xxxxxxxxx (drop leading 0)
  else if (normalized.startsWith("09")) {
    normalized = "+98" + normalized.slice(1);
  }
  // Convert leading 9xxxxxxxxx -> +98 + 9xxxxxxxxx
  else if (normalized.startsWith("9") && normalized.length === 10) {
    normalized = "+98" + normalized;
  }
  // If already starts with +98, keep it
  else if (!normalized.startsWith("+98")) {
    throw new Error("Invalid phone format");
  }

  // Validate final format: +98 followed by exactly 10 digits starting with 9
  if (!isValidIranE164(normalized)) {
    throw new Error("Invalid Iranian phone number format");
  }

  return normalized;
}

/**
 * Validates if a phone number is a valid Iranian E.164 format
 * @param phoneE164 - Phone number in E.164 format
 * @returns true if valid, false otherwise
 */
export function isValidIranE164(phoneE164: string): boolean {
  if (!phoneE164 || typeof phoneE164 !== "string") {
    return false;
  }

  // Must start with +98
  if (!phoneE164.startsWith("+98")) {
    return false;
  }

  // Must be +98 followed by exactly 10 digits starting with 9
  const digits = phoneE164.slice(3);
  const iranPhoneRegex = /^9\d{9}$/;

  return iranPhoneRegex.test(digits);
}

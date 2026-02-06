/**
 * SMS Service - OTP delivery via Kavenegar or Mock
 * Uses https://github.com/kavenegar/kavenegar-node for production
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const KavenegarApi = require("kavenegar").KavenegarApi;
import { config } from "@configs";

export interface SmsProvider {
  sendOtp(phoneE164: string, code: string): Promise<void>;
}

/**
 * Converts E.164 (+989xxxxxxxxx) to Kavenegar receptor format (09xxxxxxxxx)
 */
function e164ToKavenegarReceptor(phoneE164: string): string {
  if (phoneE164.startsWith("+98")) {
    return "0" + phoneE164.slice(3);
  }
  return phoneE164;
}

/**
 * Kavenegar SMS provider using VerifyLookup for OTP
 * Requires: KAVENGAR_API_KEY, KAVENGAR_TEMPLATE, KAVENGAR_SENDER in env
 */
export class KavenegarSmsProvider implements SmsProvider {
  private api: ReturnType<typeof KavenegarApi>;

  constructor() {
    this.api = KavenegarApi({ apikey: config.KAVENGAR_API_KEY });
  }

  async sendOtp(phoneE164: string, code: string): Promise<void> {
    const receptor = e164ToKavenegarReceptor(phoneE164);

    return new Promise((resolve, reject) => {
      this.api.VerifyLookup(
        {
          receptor,
          token: code,
          template: config.KAVENGAR_TEMPLATE,
          ...(config.KAVENGAR_SENDER && { sender: config.KAVENGAR_SENDER }),
        },
        (response: unknown, status: number) => {
          if (status === 200) {
            resolve();
          } else {
            reject(new Error(`Kavenegar API error: status=${status}, response=${JSON.stringify(response)}`));
          }
        },
      );
    });
  }
}

/**
 * Mock SMS provider - logs OTP to console (for development)
 */
export class MockSmsProvider implements SmsProvider {
  async sendOtp(phoneE164: string, code: string): Promise<void> {
    console.log("=".repeat(60));
    console.log("📱 SMS OTP (MOCK)");
    console.log("=".repeat(60));
    console.log(`To: ${phoneE164}`);
    console.log(`Code: ${code}`);
    console.log(`Time: ${new Date().toISOString()}`);
    console.log("=".repeat(60));
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}

/**
 * SMS provider singleton: Kavenegar when configured, otherwise Mock
 */
export const smsProvider: SmsProvider =
  config.KAVENGAR_API_KEY && config.KAVENGAR_TEMPLATE
    ? new KavenegarSmsProvider()
    : new MockSmsProvider();

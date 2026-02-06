import rateLimit from "express-rate-limit";
import type { Request, Response } from "express";

/**
 * Normalize IPv6 addresses to a consistent format
 * Converts IPv4-mapped IPv6 addresses (::ffff:127.0.0.1) to IPv4 (127.0.0.1)
 */
function normalizeIp(ip: string): string {
  if (!ip || ip === "unknown") return "unknown";
  
  // Handle IPv4-mapped IPv6 addresses (::ffff:127.0.0.1 -> 127.0.0.1)
  if (ip.startsWith("::ffff:")) {
    return ip.substring(7);
  }
  
  // Handle IPv6 loopback
  if (ip === "::1") {
    return "127.0.0.1";
  }
  
  return ip;
}

/**
 * Extract IP address from request, handling IPv6 and proxy scenarios
 */
function getClientIp(req: Request): string {
  let ip: string | undefined;
  
  // Check X-Forwarded-For header (when behind proxy)
  const forwardedFor = req.headers["x-forwarded-for"];
  if (forwardedFor) {
    const ips = Array.isArray(forwardedFor)
      ? forwardedFor[0]?.trim()
      : forwardedFor.split(",")[0]?.trim();
    ip = ips || req.ip || req.socket.remoteAddress;
  } else {
    // Fallback to req.ip (works with trust proxy) or socket address
    ip = req.ip || req.socket.remoteAddress;
  }
  
  return normalizeIp(ip || "unknown");
}

/**
 * Rate limiter for OTP request endpoint
 * Limits by IP + phone combination
 */
export const otpRequestRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5, // 5 requests per window
  message: {
    code: "RATE_LIMIT_EXCEEDED",
    message: "Too many OTP requests. Please try again later.",
  },
  // Use the standardized `RateLimit` response header (RFC draft)
  standardHeaders: "draft-7",
  legacyHeaders: false,
  // Custom identifier: IP + phone
  identifier: (req: Request): string => {
    const phone = req.body?.phone || ""; // Extract phone from body
    const ip = getClientIp(req); // Get the IP with proper IPv6 handling
    return `${ip}:${phone}`; // Combine IP and phone to form the unique key
  },
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      code: "RATE_LIMIT_EXCEEDED",
      message: "Too many OTP requests. Please try again later.",
    });
  },
});

/**
 * Rate Limiting Helper
 * 
 * Bu dosya rate limiting için kullanılır.
 * Upstash Redis yoksa in-memory rate limiting kullanır.
 * 
 * PRODUCTION İÇİN:
 * 1. Upstash Redis hesabı oluşturun: https://upstash.com
 * 2. .env'e ekleyin:
 *    UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
 *    UPSTASH_REDIS_REST_TOKEN=xxx
 */

import { Ratelimit, type Duration } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// In-memory store for development (not for production clusters)
const inMemoryStore = new Map<string, { count: number; resetTime: number }>();

interface RateLimitResult {
    success: boolean;
    remaining: number;
    reset: number;
}

// Rate limit configurations
export const RATE_LIMITS = {
    // Login: 5 attempts per 15 minutes
    LOGIN: { requests: 5, window: "15 m" as Duration },
    // SMS: 10 per hour per user
    SMS: { requests: 10, window: "1 h" as Duration },
    // Bulk SMS: 3 per hour
    BULK_SMS: { requests: 3, window: "1 h" as Duration },
    // General API: 100 per minute
    API: { requests: 100, window: "1 m" as Duration },
};

// Check if Upstash is configured
const hasUpstash = !!(
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN
);

// Create Redis client only if configured
let redis: Redis | null = null;
if (hasUpstash) {
    redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
}

// Create rate limiters
function createRateLimiter(config: { requests: number; window: Duration }) {
    if (redis) {
        return new Ratelimit({
            redis,
            limiter: Ratelimit.slidingWindow(config.requests, config.window),
            analytics: true,
        });
    }
    return null;
}

// In-memory rate limiting fallback
function inMemoryRateLimit(
    key: string,
    maxRequests: number,
    windowMs: number
): RateLimitResult {
    const now = Date.now();
    const record = inMemoryStore.get(key);

    if (!record || now > record.resetTime) {
        // New window
        inMemoryStore.set(key, { count: 1, resetTime: now + windowMs });
        return { success: true, remaining: maxRequests - 1, reset: now + windowMs };
    }

    if (record.count >= maxRequests) {
        return { success: false, remaining: 0, reset: record.resetTime };
    }

    record.count++;
    return { success: true, remaining: maxRequests - record.count, reset: record.resetTime };
}

// Parse window string to milliseconds
function parseWindow(window: string): number {
    const match = window.match(/^(\d+)\s*(s|m|h|d)$/);
    if (!match) return 60000; // default 1 minute

    const [, num, unit] = match;
    const value = parseInt(num, 10);

    switch (unit) {
        case 's': return value * 1000;
        case 'm': return value * 60 * 1000;
        case 'h': return value * 60 * 60 * 1000;
        case 'd': return value * 24 * 60 * 60 * 1000;
        default: return 60000;
    }
}

/**
 * Rate limit check
 * @param identifier - Unique identifier (IP, user ID, etc.)
 * @param type - Type of rate limit to apply
 * @returns Result with success status and remaining requests
 */
export async function rateLimit(
    identifier: string,
    type: keyof typeof RATE_LIMITS
): Promise<RateLimitResult> {
    const config = RATE_LIMITS[type];
    const key = `ratelimit:${type}:${identifier}`;

    if (redis) {
        const limiter = createRateLimiter(config);
        if (limiter) {
            const result = await limiter.limit(key);
            return {
                success: result.success,
                remaining: result.remaining,
                reset: result.reset,
            };
        }
    }

    // Fallback to in-memory
    return inMemoryRateLimit(key, config.requests, parseWindow(config.window));
}

/**
 * Check rate limit and throw if exceeded
 */
export async function checkRateLimit(
    identifier: string,
    type: keyof typeof RATE_LIMITS
): Promise<void> {
    const result = await rateLimit(identifier, type);

    if (!result.success) {
        const resetIn = Math.ceil((result.reset - Date.now()) / 1000);
        throw new Error(
            `Çok fazla istek. Lütfen ${resetIn} saniye sonra tekrar deneyin.`
        );
    }
}

/**
 * Get client IP from headers (for Next.js)
 */
export function getClientIP(headers: Headers): string {
    return (
        headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        headers.get("x-real-ip") ||
        "unknown"
    );
}

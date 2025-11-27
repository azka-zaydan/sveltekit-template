/**
 * Simple in-memory rate limiter for authentication endpoints
 *
 * For production, consider using a more robust solution like:
 * - Redis-based rate limiting for distributed systems
 * - @upstash/ratelimit for serverless environments
 * - Custom database-backed rate limiting
 */

interface RateLimitEntry {
	count: number;
	resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up old entries every 5 minutes
setInterval(
	() => {
		const now = Date.now();
		for (const [key, entry] of rateLimitStore.entries()) {
			if (entry.resetAt < now) {
				rateLimitStore.delete(key);
			}
		}
	},
	5 * 60 * 1000
);

export interface RateLimitConfig {
	/** Maximum number of requests allowed in the time window */
	maxAttempts: number;
	/** Time window in milliseconds */
	windowMs: number;
}

export interface RateLimitResult {
	/** Whether the request is allowed */
	allowed: boolean;
	/** Remaining requests in the current window */
	remaining: number;
	/** Timestamp when the rate limit will reset */
	resetAt: number;
}

/**
 * Check if a request should be rate limited
 *
 * @param identifier - Unique identifier for the rate limit (e.g., IP address or username)
 * @param config - Rate limit configuration
 * @returns Rate limit result
 *
 * @example
 * ```ts
 * const result = checkRateLimit(request.headers.get('x-forwarded-for') || 'unknown', {
 *   maxAttempts: 5,
 *   windowMs: 15 * 60 * 1000 // 15 minutes
 * });
 *
 * if (!result.allowed) {
 *   return json({ error: 'Too many requests' }, { status: 429 });
 * }
 * ```
 */
export function checkRateLimit(identifier: string, config: RateLimitConfig): RateLimitResult {
	const now = Date.now();
	const entry = rateLimitStore.get(identifier);

	// If no entry exists or the window has expired, create a new one
	if (!entry || entry.resetAt < now) {
		const resetAt = now + config.windowMs;
		rateLimitStore.set(identifier, { count: 1, resetAt });
		return {
			allowed: true,
			remaining: config.maxAttempts - 1,
			resetAt
		};
	}

	// Increment the count
	entry.count++;

	// Check if the limit has been exceeded
	if (entry.count > config.maxAttempts) {
		return {
			allowed: false,
			remaining: 0,
			resetAt: entry.resetAt
		};
	}

	return {
		allowed: true,
		remaining: config.maxAttempts - entry.count,
		resetAt: entry.resetAt
	};
}

/**
 * Reset the rate limit for a specific identifier
 * Useful for clearing the limit after successful authentication
 *
 * @param identifier - The identifier to reset
 */
export function resetRateLimit(identifier: string): void {
	rateLimitStore.delete(identifier);
}

import { checkRateLimit, resetRateLimit } from '$lib/server/rate-limit';
import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	// Simulate login with rate limiting
	login: async ({ getClientAddress }) => {
		const ip = getClientAddress();
		const identifier = `login:${ip}`;

		// Check rate limit: 5 attempts per 15 minutes
		const rateLimitResult = await checkRateLimit(identifier, {
			maxAttempts: 5,
			windowMs: 15 * 60 * 1000 // 15 minutes
		});

		if (!rateLimitResult.allowed) {
			return fail(429, {
				action: 'login',
				rateLimited: true,
				error: `Too many login attempts. Please try again in ${Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000 / 60)} minutes.`,
				resetAt: rateLimitResult.resetAt,
				maxAttempts: 5
			});
		}

		// Simulate successful login check
		return {
			action: 'login',
			success: true,
			remaining: rateLimitResult.remaining,
			attemptCount: 5 - rateLimitResult.remaining,
			maxAttempts: 5
		};
	},

	// Simulate API request with stricter rate limiting
	apiRequest: async ({ getClientAddress }) => {
		const ip = getClientAddress();
		const identifier = `api:${ip}`;

		// Check rate limit: 3 requests per 1 minute
		const rateLimitResult = await checkRateLimit(identifier, {
			maxAttempts: 3,
			windowMs: 60 * 1000 // 1 minute
		});

		if (!rateLimitResult.allowed) {
			return fail(429, {
				action: 'apiRequest',
				rateLimited: true,
				error: `Rate limit exceeded. Please wait ${Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000)} seconds.`,
				resetAt: rateLimitResult.resetAt,
				maxAttempts: 3
			});
		}

		return {
			action: 'apiRequest',
			success: true,
			remaining: rateLimitResult.remaining,
			maxAttempts: 3
		};
	},

	// Reset login rate limit
	reset: async ({ getClientAddress }) => {
		const ip = getClientAddress();
		const identifier = `login:${ip}`;

		resetRateLimit(identifier);

		return {
			action: 'reset',
			success: true
		};
	}
};

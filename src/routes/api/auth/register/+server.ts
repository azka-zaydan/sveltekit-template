import { db } from '$db';
import * as table from '$schema';
import * as auth from '$server/auth';
import { ApiError, ApiSuccess } from '$server/errors';
import { log } from '$server/logger';
import { withApiLogging } from '$server/logger/middleware';
import { checkRateLimit, resetRateLimit } from '$server/rate-limit';
import { registerUserSchema } from '$types/auth.schemas';
import { hash } from '@node-rs/argon2';
import { type RequestEvent } from '@sveltejs/kit';
import { randomUUID } from 'node:crypto';

export async function POST(event: RequestEvent) {
	return withApiLogging(
		event,
		async ({ requestId }) => {
			const { request, cookies, getClientAddress } = event;
			const clientIp = getClientAddress();

			// Rate limiting: 3 registration attempts per hour per IP
			const rateLimitResult = checkRateLimit(`register:${clientIp}`, {
				maxAttempts: 3,
				windowMs: 60 * 60 * 1000 // 1 hour
			});

			if (!rateLimitResult.allowed) {
				const retryAfter = Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000);
				return ApiError.rateLimitExceeded(retryAfter, requestId);
			}

			// Parse and validate request body with Zod
			let body: unknown;
			try {
				body = await request.json();
			} catch {
				return ApiError.badRequest('Invalid JSON in request body', undefined, requestId);
			}
			const result = registerUserSchema.safeParse(body);

			if (!result.success) {
				// Use new Zod error handler
				return ApiError.fromZod(result.error, requestId);
			}

			const { username, email, password, name } = result.data;

			// Hash password
			const passwordHash = await hash(password as string, {
				memoryCost: 19456,
				timeCost: 2,
				outputLen: 32,
				parallelism: 1
			});

			const userId = randomUUID();

			try {
				// Insert user into database
				await db.insert(table.user).values({
					id: userId,
					username,
					passwordHash,
					email,
					name: name || null
				}); // Create session
				const sessionToken = auth.generateSessionToken();
				const session = await auth.createSession(sessionToken, userId);

				// Reset rate limit on successful registration
				resetRateLimit(`register:${clientIp}`);

				// Log successful registration
				log.info('User registered successfully', {
					requestId,
					userId,
					username,
					email,
					operation: 'REGISTER_SUCCESS',
					schema: 'auth'
				});

				// Set session cookie
				cookies.set(auth.sessionCookieName, sessionToken, {
					expires: session.expiresAt,
					path: '/',
					httpOnly: true,
					secure: process.env.NODE_ENV === 'production',
					sameSite: 'lax'
				});

				// Return typed success response
				return ApiSuccess.created(
					{
						user: { id: userId, username, email }
					},
					{ requestId }
				);
			} catch (e: unknown) {
				const error = e as { code?: string; detail?: string; message?: string };

				// Check for unique constraint violation (PostgreSQL error code)
				if (error.code === '23505') {
					// Security: Don't reveal which field caused the conflict
					// This prevents username/email enumeration attacks
					return ApiError.conflict('An account with these credentials already exists', requestId);
				}

				// Log unexpected errors
				log.error('Registration error', {
					requestId,
					operation: 'REGISTER_ERROR',
					schema: 'auth',
					error: error.message || 'Unknown error',
					code: error.code,
					stack: error.message ? (e as Error).stack : undefined
				});

				return ApiError.internal('Failed to create account', requestId);
			}
		},
		{
			operation: 'REGISTER_USER',
			schema: 'auth',
			statusCode: 201
		}
	);
}

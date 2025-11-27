import { db } from '$db';
import * as table from '$schema';
import * as auth from '$server/auth';
import { ApiError, ApiSuccess } from '$server/errors';
import { withApiLogging } from '$server/logger/middleware';
import { checkRateLimit, resetRateLimit } from '$server/rate-limit';
import { loginUserSchema } from '$types/auth.schemas';
import { verify } from '@node-rs/argon2';
import { type RequestEvent } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export async function POST(event: RequestEvent) {
	return withApiLogging(
		event,
		async ({ requestId }) => {
			const { request, cookies, getClientAddress } = event;
			const clientIp = getClientAddress();

			// Rate limiting: 5 attempts per 15 minutes per IP
			const rateLimitResult = checkRateLimit(`login:${clientIp}`, {
				maxAttempts: 5,
				windowMs: 15 * 60 * 1000 // 15 minutes
			});

			if (!rateLimitResult.allowed) {
				const retryAfter = Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000);
				return ApiError.rateLimitExceeded(retryAfter, requestId);
			}

			// Parse and validate request body
			let body: unknown;
			try {
				body = await request.json();
			} catch {
				return ApiError.badRequest('Invalid JSON in request body', undefined, requestId);
			}
			const result = loginUserSchema.safeParse(body);

			if (!result.success) {
				return ApiError.fromZod(result.error, requestId);
			}

			const { email, password } = result.data;

			// Find user by email
			const results = await db.select().from(table.user).where(eq(table.user.email, email));
			const existingUser = results.at(0);

			if (!existingUser) {
				return ApiError.unauthorized('Incorrect email or password', requestId);
			}

			// Verify password
			const validPassword = await verify(existingUser.passwordHash, password, {
				memoryCost: 19456,
				timeCost: 2,
				outputLen: 32,
				parallelism: 1
			});

			if (!validPassword) {
				return ApiError.unauthorized('Incorrect email or password', requestId);
			}

			// Create session
			const sessionToken = auth.generateSessionToken();
			const session = await auth.createSession(sessionToken, existingUser.id);

			// Reset rate limit on successful login
			resetRateLimit(`login:${clientIp}`);

			// Set session cookie
			cookies.set(auth.sessionCookieName, sessionToken, {
				expires: session.expiresAt,
				path: '/',
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'lax'
			});

			// Return typed success response
			return ApiSuccess.ok(
				{
					user: {
						id: existingUser.id,
						username: existingUser.username,
						email: existingUser.email
					}
				},
				{ requestId }
			);
		},
		{
			operation: 'LOGIN_USER',
			schema: 'auth'
		}
	);
}

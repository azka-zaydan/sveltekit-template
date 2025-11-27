import * as auth from '$lib/server/auth';
import { log } from '$lib/server/logger';
import { generateRequestId } from '$lib/server/logger/middleware';
import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

const handleLogging: Handle = async ({ event, resolve }) => {
	const startTime = performance.now();
	const requestId = generateRequestId();
	event.locals.requestId = requestId;

	const method = event.request.method;
	const path = event.url.pathname;

	// Log incoming request
	log.http(`→ ${method} ${path}`, {
		requestId,
		method,
		path,
		userAgent: event.request.headers.get('user-agent') || undefined,
		ip: event.getClientAddress()
	});

	try {
		const response = await resolve(event);
		const duration = Math.round(performance.now() - startTime);

		// Log response
		const level = response.status >= 400 ? 'warn' : 'http';
		log[level](`← ${method} ${path} - ${response.status}`, {
			requestId,
			userId: event.locals.user?.id,
			method,
			path,
			statusCode: response.status,
			duration
		});

		return response;
	} catch (error) {
		const duration = Math.round(performance.now() - startTime);

		log.error(`✖ ${method} ${path} - Error`, {
			requestId,
			method,
			path,
			duration,
			error: error instanceof Error ? error.message : 'Unknown error',
			stack: error instanceof Error ? error.stack : undefined
		});

		throw error;
	}
};

const handleAuth: Handle = async ({ event, resolve }) => {
	const sessionToken = event.cookies.get(auth.sessionCookieName);

	if (!sessionToken) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	const { session, user } = await auth.validateSessionToken(sessionToken);

	if (session) {
		auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
	} else {
		auth.deleteSessionTokenCookie(event);
		// Log session invalidation
		log.debug('Invalid session token detected', {
			requestId: event.locals.requestId,
			operation: 'SESSION_INVALIDATION'
		});
	}

	event.locals.user = user;
	event.locals.session = session;
	return resolve(event);
};

export const handle = sequence(handleLogging, handleAuth);

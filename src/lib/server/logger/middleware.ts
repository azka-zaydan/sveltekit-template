import { encodeBase64url } from '@oslojs/encoding';
import type { RequestEvent } from '@sveltejs/kit';
import { json, type NumericRange } from '@sveltejs/kit';
import { log } from './index';

/**
 * Generate a unique request ID for tracking
 */
export function generateRequestId(): string {
	const bytes = crypto.getRandomValues(new Uint8Array(12));
	return `req_${encodeBase64url(bytes)}`;
}

/**
 * Extract relevant request context for logging
 */
export function getRequestContext(event: RequestEvent) {
	return {
		requestId: event.locals.requestId,
		userId: event.locals.user?.id,
		method: event.request.method,
		path: event.url.pathname,
		userAgent: event.request.headers.get('user-agent') || undefined,
		ip: event.getClientAddress()
	};
}

/**
 * Enhanced API request wrapper with automatic logging and error handling
 *
 * This is the recommended way to wrap API endpoints. It provides:
 * - Automatic request/response logging with timing
 * - Structured error logging with stack traces
 * - Type-safe response handling
 * - Request context propagation
 *
 * IMPORTANT: To set custom response headers, return a Response object directly
 * or pass headers via the options parameter, as SvelteKit's setHeaders() won't
 * work with the json() wrapper.
 *
 * @example
 * ```typescript
 * // Option 1: Pass headers via options
 * export async function GET(event) {
 *   return withApiLogging(
 *     event,
 *     async ({ userId }) => {
 *       const data = await fetchData(userId);
 *       return { data };
 *     },
 *     {
 *       operation: 'GET_DATA',
 *       headers: { 'cache-control': 'public, max-age=60' }
 *     }
 *   );
 * }
 *
 * // Option 2: Return Response directly for full control
 * export async function GET(event) {
 *   return withApiLogging(event, async ({ userId }) => {
 *     const data = await fetchData(userId);
 *     return json(data, {
 *       headers: { 'cache-control': 'public, max-age=60' }
 *     });
 *   });
 * }
 * ```
 */
export async function withApiLogging<T>(
	event: RequestEvent,
	handler: (context: {
		userId: string | undefined;
		requestId: string;
		event: RequestEvent;
	}) => Promise<T>,
	options?: {
		operation?: string;
		schema?: 'auth' | 'app' | 'master' | 'public';
		statusCode?: NumericRange<200, 599>;
		headers?: Record<string, string>;
	}
) {
	const startTime = performance.now();
	const { requestId, userId, method, path } = getRequestContext(event);

	// Log incoming request
	log.http(`→ ${method} ${path}`, {
		requestId,
		userId,
		method,
		path,
		operation: options?.operation,
		schema: options?.schema
	});

	try {
		// Execute the handler with context
		const result = await handler({ userId, requestId, event });
		const duration = Math.round(performance.now() - startTime);
		const statusCode = options?.statusCode || 200;

		// Log successful response
		log.http(`← ${method} ${path} - ${statusCode}`, {
			requestId,
			userId,
			method,
			path,
			statusCode,
			duration,
			operation: options?.operation,
			schema: options?.schema
		});

		// If handler returned a Response, return it directly (preserves all headers)
		if (result instanceof Response) {
			return result;
		}

		// Otherwise wrap in json() with any headers from options
		return json(result, {
			status: statusCode,
			headers: options?.headers
		});
	} catch (error) {
		const duration = Math.round(performance.now() - startTime);

		// Log error response
		if (error instanceof Error) {
			log.error(`✖ ${method} ${path} - Error`, {
				requestId,
				userId,
				method,
				path,
				duration,
				operation: options?.operation,
				schema: options?.schema,
				error: error.message,
				stack: error.stack
			});
		} else {
			log.error(`✖ ${method} ${path} - Unknown error`, {
				requestId,
				userId,
				method,
				path,
				duration,
				operation: options?.operation,
				schema: options?.schema
			});
		}

		// Re-throw to maintain error handling flow
		throw error;
	}
}

/**
 * Simple wrapper for logging API responses with custom status codes
 * Use when you need fine-grained control over the response
 *
 * @example
 * ```typescript
 * export async function GET(event) {
 *   const data = await fetchData();
 *
 *   if (!data) {
 *     logApiResponse(event, 404, performance.now() - start);
 *     return json({ error: 'Not found' }, { status: 404 });
 *   }
 *
 *   logApiResponse(event, 200, performance.now() - start);
 *   return json({ data });
 * }
 * ```
 */
export function logApiResponse(
	event: RequestEvent,
	statusCode: number,
	duration: number,
	meta?: Record<string, unknown>
) {
	const { requestId, userId, method, path } = getRequestContext(event);

	const level = statusCode >= 400 ? 'warn' : 'http';
	const message = `← ${method} ${path} - ${statusCode}`;

	log[level](message, {
		requestId,
		userId,
		method,
		path,
		statusCode,
		duration,
		...meta
	});
}

/**
 * Wrapper for operations that need performance tracking
 * Logs a warning if operation takes longer than threshold
 *
 * @example
 * ```typescript
 * const users = await trackPerformance(
 *   'fetch_all_users',
 *   () => db.select().from(users),
 *   { threshold: 500, requestId: event.locals.requestId }
 * );
 * ```
 */
export async function trackPerformance<T>(
	operationName: string,
	operation: () => Promise<T>,
	options?: {
		threshold?: number;
		requestId?: string;
		schema?: 'auth' | 'app' | 'master' | 'public';
		meta?: Record<string, unknown>;
	}
): Promise<T> {
	const startTime = performance.now();
	const threshold = options?.threshold || 1000;

	try {
		const result = await operation();
		const duration = Math.round(performance.now() - startTime);

		if (duration > threshold) {
			log.warn(`Slow operation: ${operationName}`, {
				operation: 'SLOW_OPERATION',
				operationName,
				duration,
				threshold,
				requestId: options?.requestId,
				schema: options?.schema,
				...options?.meta
			});
		} else {
			log.debug(`Operation completed: ${operationName}`, {
				operation: 'OPERATION_COMPLETE',
				operationName,
				duration,
				requestId: options?.requestId,
				schema: options?.schema,
				...options?.meta
			});
		}

		return result;
	} catch (error) {
		const duration = Math.round(performance.now() - startTime);

		log.error(`Operation failed: ${operationName}`, {
			operation: 'OPERATION_FAILED',
			operationName,
			duration,
			requestId: options?.requestId,
			schema: options?.schema,
			error: error instanceof Error ? error.message : 'Unknown error',
			stack: error instanceof Error ? error.stack : undefined,
			...options?.meta
		});

		throw error;
	}
}

/**
 * DEPRECATED: Use withApiLogging instead
 * @deprecated Use withApiLogging for better type safety and error handling
 */
export async function logApiRequest<T>(event: RequestEvent, handler: () => Promise<T>): Promise<T> {
	const startTime = performance.now();
	const { requestId, userId, method, path, userAgent, ip } = getRequestContext(event);

	// Log incoming request
	log.http(`${method} ${path}`, {
		requestId,
		userId,
		method,
		path,
		userAgent,
		ip
	});

	try {
		// Execute the handler
		const result = await handler();
		const duration = Math.round(performance.now() - startTime);

		// Log successful response
		log.http(`${method} ${path} - 200 OK`, {
			requestId,
			userId,
			method,
			path,
			statusCode: 200,
			duration
		});

		return result;
	} catch (error) {
		const duration = Math.round(performance.now() - startTime);

		// Log error response
		if (error instanceof Error) {
			log.error(`${method} ${path} - Error`, {
				requestId,
				userId,
				method,
				path,
				duration,
				error: error.message,
				stack: error.stack
			});
		} else {
			log.error(`${method} ${path} - Unknown error`, {
				requestId,
				userId,
				method,
				path,
				duration
			});
		}

		// Re-throw to maintain error handling flow
		throw error;
	}
}

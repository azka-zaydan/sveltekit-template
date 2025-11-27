/**
 * Standardized API error handling with Zod integration
 * Based on RFC 7807 Problem Details for HTTP APIs (simplified)
 */

import { json, type NumericRange } from '@sveltejs/kit';
import { z } from 'zod';
import { log } from './logger';

// ============================================================================
// ERROR TYPES
// ============================================================================

/**
 * Error types for consistent client-side error handling
 */
export const ErrorType = {
	VALIDATION_ERROR: 'validation_error',
	AUTHENTICATION_ERROR: 'authentication_error',
	AUTHORIZATION_ERROR: 'authorization_error',
	RESOURCE_NOT_FOUND: 'resource_not_found',
	RESOURCE_CONFLICT: 'resource_conflict',
	RATE_LIMIT_ERROR: 'rate_limit_error',
	INTERNAL_ERROR: 'internal_error'
} as const;

export type ErrorType = (typeof ErrorType)[keyof typeof ErrorType];

/**
 * Standard error response structure
 */
export interface ApiErrorResponse {
	/** Machine-readable error type for client handling */
	type: ErrorType;
	/** Human-readable error title */
	title: string;
	/** Detailed explanation of the error */
	detail: string;
	/** HTTP status code */
	status: number;
	/** Optional validation errors for field-level feedback */
	errors?: Record<string, string[]>;
	/** Optional additional metadata */
	[key: string]: unknown;
}

// ============================================================================
// ZOD ERROR HANDLING
// ============================================================================

/**
 * Type guard to check if error is a ZodError
 */
export function isZodError(error: unknown): error is z.ZodError {
	return (
		typeof error === 'object' &&
		error !== null &&
		'issues' in error &&
		Array.isArray((error as { issues: unknown }).issues)
	);
}

/**
 * Convert Zod issues to field-level error map
 * Returns: { fieldName: ['error1', 'error2'], ... }
 */
export function zodIssuesToFieldErrors(issues: z.ZodIssue[]): Record<string, string[]> {
	const fieldErrors: Record<string, string[]> = {};

	for (const issue of issues) {
		// Get field path (e.g., ['user', 'email'] becomes 'user.email')
		const field = issue.path.length > 0 ? issue.path.join('.') : '_root';

		if (!fieldErrors[field]) {
			fieldErrors[field] = [];
		}

		fieldErrors[field].push(issue.message);
	}

	return fieldErrors;
}

/**
 * Create validation error response from ZodError
 */
export function fromZodError(error: z.ZodError, requestId?: string): Response {
	const fieldErrors = zodIssuesToFieldErrors(error.issues);

	log.warn('[Validation Error]', {
		requestId,
		errorCount: error.issues.length,
		fields: Object.keys(fieldErrors)
	});

	return json(
		{
			type: ErrorType.VALIDATION_ERROR,
			title: 'Validation Failed',
			detail: 'The provided data is invalid. Please check the errors and try again.',
			status: 400,
			errors: fieldErrors
		} satisfies ApiErrorResponse,
		{
			status: 400,
			headers: {
				'Content-Type': 'application/json'
			}
		}
	);
}

// ============================================================================
// ERROR RESPONSE BUILDERS
// ============================================================================

/**
 * Create a standardized API error response
 */
export function createApiError(
	status: NumericRange<400, 599>,
	type: ErrorType,
	title: string,
	detail: string,
	metadata?: {
		errors?: Record<string, string[]>;
		requestId?: string;
		[key: string]: unknown;
	}
): Response {
	const errorResponse: ApiErrorResponse = {
		type,
		title,
		detail,
		status
	};

	// Add field-level validation errors if provided
	if (metadata?.errors) {
		errorResponse.errors = metadata.errors;
	}

	// Add any other metadata
	if (metadata) {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { errors: _errors, requestId: _requestId, ...rest } = metadata;
		Object.assign(errorResponse, rest);
	}

	// Log error for monitoring (warnings for client errors, errors for server errors)
	const logLevel = status >= 500 ? 'error' : 'warn';
	const logMessage = `[API Error] ${title}`;
	const logData = {
		requestId: metadata?.requestId,
		type,
		status,
		detail,
		errorFields: metadata?.errors ? Object.keys(metadata.errors) : undefined
	};

	if (logLevel === 'error') {
		log.error(logMessage, logData);
	} else {
		log.warn(logMessage, logData);
	}

	return json(errorResponse, {
		status,
		headers: {
			'Content-Type': 'application/json'
		}
	});
}

/**
 * Common error creators for convenience
 *
 * @example
 * ```typescript
 * // Validation error from Zod
 * const result = registerSchema.safeParse(body);
 * if (!result.success) {
 *   return ApiError.fromZod(result.error, requestId);
 * }
 *
 * // Custom validation error
 * if (!data.title) {
 *   return ApiError.badRequest('Title is required', undefined, requestId);
 * }
 *
 * // Authentication required
 * if (!locals.user) {
 *   return ApiError.unauthorized('You must be logged in', requestId);
 * }
 *
 * // Insufficient permissions
 * if (listing.userId !== locals.user.id) {
 *   return ApiError.forbidden('You can only edit your own listings', requestId);
 * }
 *
 * // Resource not found
 * const user = await findUser(id);
 * if (!user) {
 *   return ApiError.notFound('User', requestId);
 * }
 *
 * // Conflict (e.g., duplicate username)
 * if (await usernameExists(username)) {
 *   return ApiError.conflict('Username already taken', requestId);
 * }
 *
 * // Rate limit exceeded
 * if (!rateLimitResult.allowed) {
 *   return ApiError.rateLimitExceeded(retryAfter, requestId);
 * }
 *
 * // Internal server error
 * try {
 *   // ... operation
 * } catch (error) {
 *   return ApiError.internal('Failed to process request', requestId);
 * }
 * ```
 */
export const ApiError = {
	/** 400 Bad Request - Validation or input errors */
	badRequest: (detail: string, errors?: Record<string, string[]>, requestId?: string) =>
		createApiError(400, ErrorType.VALIDATION_ERROR, 'Invalid Request', detail, {
			errors,
			requestId
		}),

	/** 400 Bad Request - From Zod validation error */
	fromZod: (error: z.ZodError, requestId?: string) => fromZodError(error, requestId),

	/** 401 Unauthorized - Authentication required */
	unauthorized: (detail = 'Authentication required', requestId?: string) =>
		createApiError(401, ErrorType.AUTHENTICATION_ERROR, 'Unauthorized', detail, { requestId }),

	/** 403 Forbidden - Insufficient permissions */
	forbidden: (detail = 'Insufficient permissions', requestId?: string) =>
		createApiError(403, ErrorType.AUTHORIZATION_ERROR, 'Forbidden', detail, { requestId }),

	/** 404 Not Found - Resource doesn't exist */
	notFound: (resource: string, requestId?: string) =>
		createApiError(404, ErrorType.RESOURCE_NOT_FOUND, 'Not Found', `${resource} not found`, {
			requestId
		}),

	/** 409 Conflict - Resource already exists or conflict with current state */
	conflict: (detail: string, requestId?: string) =>
		createApiError(409, ErrorType.RESOURCE_CONFLICT, 'Conflict', detail, { requestId }),

	/** 429 Too Many Requests - Rate limit exceeded */
	rateLimitExceeded: (retryAfter: number, requestId?: string) =>
		createApiError(
			429,
			ErrorType.RATE_LIMIT_ERROR,
			'Too Many Requests',
			'Rate limit exceeded. Please try again later.',
			{
				retryAfter,
				requestId
			}
		),

	/** 500 Internal Server Error - Unexpected server error */
	internal: (detail = 'An unexpected error occurred', requestId?: string) =>
		createApiError(500, ErrorType.INTERNAL_ERROR, 'Internal Server Error', detail, { requestId })
};

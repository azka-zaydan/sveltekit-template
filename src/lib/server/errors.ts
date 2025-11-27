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
export function isZodError(error: unknown): error is z.core.$ZodError {
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
export function zodIssuesToFieldErrors(issues: z.core.$ZodIssue[]): Record<string, string[]> {
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
export function fromZodError(error: z.core.$ZodError, requestId?: string): Response {
	const fieldErrors = zodIssuesToFieldErrors(error.issues);

	log.warn('Validation error', {
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
	log[logLevel](`API Error: ${title}`, {
		requestId: metadata?.requestId,
		type,
		status,
		detail,
		errorFields: metadata?.errors ? Object.keys(metadata.errors) : undefined
	});

	return json(errorResponse, {
		status,
		headers: {
			'Content-Type': 'application/json'
		}
	});
}

/**
 * Common error creators for convenience
 */
export const ApiError = {
	/** 400 Bad Request - Validation or input errors */
	badRequest: (detail: string, errors?: Record<string, string[]>, requestId?: string) =>
		createApiError(400, ErrorType.VALIDATION_ERROR, 'Invalid Request', detail, {
			errors,
			requestId
		}),

	/** 400 Bad Request - From Zod validation error */
	fromZod: (error: z.core.$ZodError, requestId?: string) => fromZodError(error, requestId),

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

// ===========================
// Typed Success Responses
// ===========================

/** Generic success response structure */
export interface ApiSuccessResponse<T = unknown> {
	/** Indicates this is a success response */
	success: true;
	/** The response data */
	data: T;
	/** HTTP status code */
	status: number;
	/** Optional metadata */
	meta?: {
		/** Request ID for tracing */
		requestId?: string;
		/** Pagination info */
		pagination?: {
			total: number;
			limit: number;
			offset: number;
			hasMore: boolean;
		};
		/** Timestamp of the response */
		timestamp?: string;
		[key: string]: unknown;
	};
}

/**
 * Helper to create typed success responses
 *
 * @example
 * ```typescript
 * // Simple success
 * return ApiSuccess.ok({ id: '123', name: 'John' }, { requestId });
 *
 * // Created resource
 * return ApiSuccess.created(newUser, { requestId, resourceId: newUser.id });
 *
 * // Paginated list
 * return ApiSuccess.ok(users, {
 *   requestId,
 *   pagination: { total: 100, limit: 10, offset: 0, hasMore: true }
 * });
 * ```
 */
export const ApiSuccess = {
	/** 200 OK - Standard success response */
	ok: <T>(data: T, meta?: ApiSuccessResponse<T>['meta']): Response => {
		const response: ApiSuccessResponse<T> = {
			success: true,
			data,
			status: 200,
			...(meta && { meta: { ...meta, timestamp: new Date().toISOString() } })
		};
		return json(response, { status: 200 });
	},

	/** 201 Created - Resource successfully created */
	created: <T>(data: T, meta?: ApiSuccessResponse<T>['meta']): Response => {
		const response: ApiSuccessResponse<T> = {
			success: true,
			data,
			status: 201,
			...(meta && { meta: { ...meta, timestamp: new Date().toISOString() } })
		};
		return json(response, { status: 201 });
	},

	/** 204 No Content - Success with no response body */
	noContent: (): Response => new Response(null, { status: 204 })
};

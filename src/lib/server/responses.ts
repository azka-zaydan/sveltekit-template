/**
 * Typed API response helpers
 * Provides consistent response structure for all API endpoints
 */

import { json } from '@sveltejs/kit';

// ============================================================================
// SUCCESS RESPONSE TYPES
// ============================================================================

/**
 * Standard success response structure
 */
export interface ApiSuccessResponse<T = unknown> {
	success: true;
	data: T;
	message?: string;
}

/**
 * Paginated response structure
 */
export interface PaginatedResponse<T = unknown> {
	success: true;
	data: T[];
	pagination: {
		total: number;
		limit: number;
		offset: number;
		hasMore: boolean;
	};
}

// ============================================================================
// RESPONSE BUILDERS
// ============================================================================

/**
 * Create a successful JSON response
 *
 * @example
 * ```typescript
 * return success({ id: '123', name: 'John' });
 * // Returns: { success: true, data: { id: '123', name: 'John' } }
 *
 * return success({ id: '123' }, 'User created successfully', 201);
 * ```
 */
export function success<T>(data: T, message?: string, status: number = 200): Response {
	const response: ApiSuccessResponse<T> = {
		success: true,
		data
	};

	if (message) {
		response.message = message;
	}

	return json(response, {
		status,
		headers: {
			'Content-Type': 'application/json'
		}
	});
}

/**
 * Create a paginated JSON response
 *
 * @example
 * ```typescript
 * return paginated(listings, { total: 100, limit: 20, offset: 0 });
 * ```
 */
export function paginated<T>(
	data: T[],
	pagination: {
		total: number;
		limit: number;
		offset: number;
	},
	headers?: Record<string, string>
): Response {
	const response: PaginatedResponse<T> = {
		success: true,
		data,
		pagination: {
			...pagination,
			hasMore: pagination.offset + pagination.limit < pagination.total
		}
	};

	return json(response, {
		status: 200,
		headers: {
			'Content-Type': 'application/json',
			'X-Total-Count': pagination.total.toString(),
			...headers
		}
	});
}

/**
 * Create a 201 Created response
 *
 * @example
 * ```typescript
 * return created({ id: '123', username: 'john' }, 'User created');
 * ```
 */
export function created<T>(data: T, message?: string): Response {
	return success(data, message, 201);
}

/**
 * Create a 204 No Content response (for DELETE, etc.)
 *
 * @example
 * ```typescript
 * return noContent();
 * ```
 */
export function noContent(): Response {
	return new Response(null, {
		status: 204,
		headers: {
			'Content-Type': 'application/json'
		}
	});
}

// ============================================================================
// TYPE GUARDS FOR CLIENT-SIDE
// ============================================================================

/**
 * Type guard to check if response is a success response
 */
export function isSuccessResponse<T = unknown>(
	response: unknown
): response is ApiSuccessResponse<T> {
	return (
		typeof response === 'object' &&
		response !== null &&
		'success' in response &&
		response.success === true &&
		'data' in response
	);
}

/**
 * Type guard to check if response is a paginated response
 */
export function isPaginatedResponse<T = unknown>(
	response: unknown
): response is PaginatedResponse<T> {
	return (
		isSuccessResponse(response) &&
		'pagination' in response &&
		typeof response.pagination === 'object' &&
		response.pagination !== null &&
		'total' in response.pagination
	);
}

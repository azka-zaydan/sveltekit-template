import { ApiError } from '$lib/server/errors';
import { created, success } from '$lib/server/responses';
import { z } from 'zod';
import type { RequestHandler } from './$types';

// Demo validation schema
const createItemSchema = z.object({
	name: z.string().min(3, 'Name must be at least 3 characters'),
	email: z.string().email('Invalid email address'),
	age: z.number().min(18, 'Must be at least 18')
});

/**
 * GET /demo/logger/api/test
 * Demonstrates successful API response with logging
 */
export const GET: RequestHandler = async ({ url }) => {
	const testType = url.searchParams.get('type') || 'success';

	// Generate a mock request ID (in production, this comes from hooks.server.ts)
	const requestId = `demo_${Date.now()}`;

	console.log(`[API Request] GET /demo/logger/api/test?type=${testType}`, { requestId });

	switch (testType) {
		case 'success':
			console.log('[API Success] Returning sample data', { requestId, itemCount: 3 });
			return success(
				{
					items: [
						{ id: 1, name: 'Item 1' },
						{ id: 2, name: 'Item 2' },
						{ id: 3, name: 'Item 3' }
					]
				},
				'Items retrieved successfully'
			);

		case 'unauthorized':
			// This will automatically log to console with console.warn()
			return ApiError.unauthorized('You must be logged in to access this resource', requestId);

		case 'forbidden':
			return ApiError.forbidden('You do not have permission to access this resource', requestId);

		case 'notFound':
			return ApiError.notFound('Item', requestId);

		case 'conflict':
			return ApiError.conflict('An item with this name already exists', requestId);

		case 'internal':
			// This will automatically log to console with console.error() (not warn)
			return ApiError.internal('Database connection failed', requestId);

		default:
			return ApiError.badRequest('Invalid test type', undefined, requestId);
	}
};

/**
 * POST /demo/logger/api/test
 * Demonstrates validation errors with Zod
 */
export const POST: RequestHandler = async ({ request }) => {
	const requestId = `demo_${Date.now()}`;

	console.log('[API Request] POST /demo/logger/api/test', { requestId });

	try {
		const body = await request.json();

		// Validate with Zod schema
		const result = createItemSchema.safeParse(body);

		if (!result.success) {
			// This automatically extracts field-level errors and logs to console with console.warn()
			return ApiError.fromZod(result.error, requestId);
		}

		console.log('[API Success] Item created', { requestId, data: result.data });

		// Success response
		return created(
			{
				id: Math.random().toString(36).substring(7),
				...result.data,
				createdAt: new Date().toISOString()
			},
			'Item created successfully'
		);
	} catch (error) {
		console.error('[API Error] Failed to parse JSON', { requestId, error });
		return ApiError.badRequest('Invalid JSON in request body', undefined, requestId);
	}
};

import { fail } from '@sveltejs/kit';
import { z } from 'zod';
import type { Actions } from './$types';

// Demo validation schema
const demoSchema = z.object({
	email: z.string().email('Invalid email address'),
	age: z.coerce.number().min(18, 'Must be at least 18 years old').max(120, 'Invalid age')
});

export const actions = {
	/**
	 * Demonstrate Zod validation errors with field-level feedback
	 */
	validateData: async ({ request }) => {
		const formData = await request.formData();
		const data = Object.fromEntries(formData);

		// Validate using Zod schema
		const result = demoSchema.safeParse(data);

		if (!result.success) {
			// Extract field-level errors for display
			const errors: Record<string, string[]> = {};
			result.error.issues.forEach((issue) => {
				const field = issue.path[0] as string;
				if (!errors[field]) errors[field] = [];
				errors[field].push(issue.message);
			});

			console.log('Validation failed - check console for ApiError log');

			return fail(400, {
				action: 'validateData',
				errors,
				email: data.email as string,
				age: data.age as string
			});
		}

		console.log('✓ Validation passed!', result.data);

		return {
			action: 'validateData',
			success: true,
			data: result.data
		};
	},

	/**
	 * Demonstrate 401 Unauthorized error
	 */
	unauthorized: async () => {
		// Simulate checking if user is authenticated
		const isAuthenticated = false;

		if (!isAuthenticated) {
			console.log('Triggering unauthorized error - check console for ApiError log');

			// This would normally be done in an API route, but we'll simulate the error
			return fail(401, {
				action: 'unauthorized',
				error: 'You must be logged in to access this resource'
			});
		}

		return { action: 'unauthorized', success: true };
	},

	/**
	 * Demonstrate 403 Forbidden error
	 */
	forbidden: async () => {
		// Simulate checking permissions
		const hasPermission = false;

		if (!hasPermission) {
			console.log('Triggering forbidden error - check console for ApiError log');

			return fail(403, {
				action: 'forbidden',
				error: 'You do not have permission to perform this action'
			});
		}

		return { action: 'forbidden', success: true };
	},

	/**
	 * Demonstrate 404 Not Found error
	 */
	notFound: async () => {
		// Simulate resource lookup
		const resource = null;

		if (!resource) {
			console.log('Triggering not found error - check console for ApiError log');

			return fail(404, {
				action: 'notFound',
				error: 'The requested resource was not found'
			});
		}

		return { action: 'notFound', success: true };
	},

	/**
	 * Demonstrate 409 Conflict error
	 */
	conflict: async () => {
		// Simulate duplicate check
		const alreadyExists = true;

		if (alreadyExists) {
			console.log('Triggering conflict error - check console for ApiError log');

			return fail(409, {
				action: 'conflict',
				error: 'A resource with this identifier already exists'
			});
		}

		return { action: 'conflict', success: true };
	},

	/**
	 * Demonstrate 500 Internal Server Error
	 */
	internalError: async () => {
		try {
			// Simulate something going wrong
			throw new Error('Database connection failed');
		} catch (error) {
			console.log('Triggering internal error - check console for ApiError log (error level)');
			console.error('Simulated error:', error);

			return fail(500, {
				action: 'internalError',
				error: 'An unexpected error occurred. Please try again later.'
			});
		}
	}
} satisfies Actions;

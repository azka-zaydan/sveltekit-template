import { createApiClient } from '$api/client';
import { registerUserSchema } from '$types/auth.schemas';
import { fail, redirect, type RequestEvent } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event: RequestEvent) => {
	if (event.locals.user) {
		return redirect(302, '/dashboard');
	}
	return {};
};

export const actions: Actions = {
	default: async ({ request, fetch }: RequestEvent) => {
		const api = createApiClient(fetch);
		const formData = await request.formData();
		const username = formData.get('username');
		const email = formData.get('email');
		const password = formData.get('password');
		const name = formData.get('name');

		// Validate input using Zod schema
		const result = registerUserSchema.safeParse({ username, email, password, name });

		if (!result.success) {
			const errors: Record<string, string[]> = {};
			result.error.issues.forEach((err) => {
				const path = err.path[0] as string;
				if (!errors[path]) errors[path] = [];
				errors[path].push(err.message);
			});

			return fail(400, {
				message: 'Please fix the validation errors',
				username: username as string,
				email: email as string,
				name: name as string,
				errors
			});
		}

		try {
			await api.auth.register(result.data);

			// Return success - redirect happens on client
			return { success: true };
		} catch (error) {
			const err = error as Error;
			return fail(409, {
				message: err.message || 'Registration failed. Please try again.',
				username: username as string,
				email: email as string,
				name: name as string,
				errors: {} // Include errors field for type compatibility
			});
		}
	}
};

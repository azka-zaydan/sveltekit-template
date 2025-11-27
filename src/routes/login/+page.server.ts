import { createApiClient } from '$api/client';
import { loginUserSchema } from '$types/auth.schemas';
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
		const email = formData.get('email');
		const password = formData.get('password');

		// Validate input using Zod schema
		const result = loginUserSchema.safeParse({ email, password });

		if (!result.success) {
			const errors: Record<string, string[]> = {};
			result.error.issues.forEach((err) => {
				const path = err.path[0] as string;
				if (!errors[path]) errors[path] = [];
				errors[path].push(err.message);
			});

			return fail(400, {
				message: 'Please fix the validation errors',
				email: email as string,
				errors
			});
		}

		try {
			await api.auth.login(result.data);

			// Return success - redirect happens on client
			return { success: true };
		} catch (error) {
			const err = error as Error;
			return fail(401, {
				message: err.message || 'Login failed. Please check your credentials and try again.',
				email: email as string,
				errors: {} // Include errors field for type compatibility
			});
		}
	}
};

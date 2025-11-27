/**
 * Authentication API client
 */

import type { ApiAuthResponse } from '$types/auth.schemas';
import { loginUserSchema, registerUserSchema } from '$types/auth.schemas';
import { apiFetch } from './base';

export function createAuthApi(fetch: typeof globalThis.fetch) {
	return {
		/**
		 * Register a new user
		 * POST /api/auth/register
		 */
		async register(data: {
			username: string;
			email: string;
			password: string;
			name?: string | null;
		}): Promise<ApiAuthResponse> {
			// Validate data before sending
			const validatedData = registerUserSchema.parse(data);

			return apiFetch<ApiAuthResponse>(fetch, '/api/auth/register', {
				method: 'POST',
				body: JSON.stringify(validatedData)
			});
		},

		/**
		 * Login user
		 * POST /api/auth/login
		 */
		async login(data: { email: string; password: string }): Promise<ApiAuthResponse> {
			// Validate data before sending
			const validatedData = loginUserSchema.parse(data);

			return apiFetch<ApiAuthResponse>(fetch, '/api/auth/login', {
				method: 'POST',
				body: JSON.stringify(validatedData)
			});
		},

		/**
		 * Logout user
		 * POST /api/auth/logout
		 */
		async logout(): Promise<{ message: string }> {
			return apiFetch<{ message: string }>(fetch, '/api/auth/logout', {
				method: 'POST'
			});
		}
	};
}

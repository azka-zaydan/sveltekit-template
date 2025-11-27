/**
 * Type-safe API client factory for making requests to internal API endpoints
 *
 * Usage in +page.server.ts files:
 * ```typescript
 * import { createApiClient } from '$lib/api/client';
 *
 * export const load: PageServerLoad = async ({ fetch }) => {
 *   const api = createApiClient(fetch);
 *   const data = await api.auth.login({ email, password });
 *   return { data };
 * };
 * ```
 */

import { createAuthApi } from './auth';

/**
 * Create an API client instance with the given fetch function
 * @param fetch - The fetch function from the request event (for SSR) or global fetch
 */
export function createApiClient(fetch: typeof globalThis.fetch) {
	return {
		auth: createAuthApi(fetch)
		// Add more API modules here as you build them
		// listings: createListingsApi(fetch),
		// categories: createCategoriesApi(fetch),
		// etc.
	};
}

/**
 * @deprecated Use createApiClient(fetch) instead to pass the fetch function from the request event
 */
export const api = createApiClient(fetch);

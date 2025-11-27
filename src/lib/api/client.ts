import { createAuthApi } from './auth';
import { createItemsApi } from './items';

export function createApiClient(fetch: typeof globalThis.fetch) {
	return {
		auth: createAuthApi(fetch),
		items: createItemsApi(fetch)
	};
}

export const api = createApiClient(fetch);
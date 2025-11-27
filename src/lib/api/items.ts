import {
	createItemSchema,
	itemQuerySchema,
	type CreateItem,
	type Item,
	type ItemQuery
} from '$lib/types/app.schemas';
import { apiFetch, buildQueryString } from './base';

interface ItemsResponse {
	items: Item[];
}

interface ItemResponse {
	item: Item;
}

export function createItemsApi(fetch: typeof globalThis.fetch) {
	return {
		async getAll(params?: ItemQuery): Promise<ItemsResponse> {
			const validated = params ? itemQuerySchema.parse(params) : {};
			const query = buildQueryString(validated);
			return apiFetch<ItemsResponse>(fetch, `/api/items${query}`);
		},

		async getById(id: string): Promise<ItemResponse> {
			return apiFetch<ItemResponse>(fetch, `/api/items/${id}`);
		},

		async create(data: CreateItem): Promise<ItemResponse> {
			const validated = createItemSchema.parse(data);
			return apiFetch<ItemResponse>(fetch, '/api/items', {
				method: 'POST',
				body: JSON.stringify(validated)
			});
		}
	};
}

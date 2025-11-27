# API Client Architecture (Type-Safe Pattern)

> **See also**: [`/docs/API.md`](../../docs/API.md) for complete API endpoint reference

This project uses a **type-safe API client factory pattern** to make requests to internal API endpoints.

## Benefits

- **Automatic validation** before sending requests
- **Type safety** throughout the request/response cycle
- **Consistent error handling**
- **SSR-compatible** (uses fetch from request event)

## Using the API Client

**ALWAYS use `createApiClient(fetch)` in server-side code**:

```typescript
// src/routes/+page.server.ts
import { createApiClient } from '$lib/api/client';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
	const api = createApiClient(fetch);

	// Type-safe API calls with automatic validation
	const items = await api.items.getAll({ limit: 10 });

	return { items };
};
```

## API Client Structure

Located in `src/lib/api/`:

- `client.ts` - Factory function that creates API client
- `base.ts` - Base fetch wrapper with error handling
- `auth.ts` - Authentication endpoints
- `items.ts` - Example CRUD operations (replace with your modules)

## How API Methods Work

**All API methods validate input** before sending:

```typescript
// src/lib/api/items.ts
export function createItemsApi(fetch: typeof globalThis.fetch) {
	return {
		async create(data: unknown): Promise<ItemResponse> {
			// Validates using createItemSchema before sending
			const validatedData = createItemSchema.parse(data);

			return apiFetch<ItemResponse>(fetch, '/api/items', {
				method: 'POST',
				body: JSON.stringify(validatedData)
			});
		},

		async getAll(params?: ItemQuery): Promise<ApiItemsResponse> {
			const validatedParams = params ? itemQuerySchema.parse(params) : {};
			const queryString = buildQueryString(validatedParams);
			return apiFetch<ApiItemsResponse>(fetch, `/api/items${queryString}`);
		}
	};
}
```

## Adding New API Endpoints

### 1. Create Zod Schemas

```typescript
// src/lib/types/features.schemas.ts
export const createFeatureSchema = z.object({
	name: z.string().min(1).max(100)
});

export const featureResponseSchema = z.object({
	id: uuidSchema,
	name: z.string(),
	createdAt: z.coerce.date()
});
```

### 2. Create API Client Module

```typescript
// src/lib/api/features.ts
import { createFeatureSchema, type FeatureResponse } from '$lib/types/features.schemas';
import { apiFetch } from './base';

export function createFeaturesApi(fetch: typeof globalThis.fetch) {
	return {
		async create(data: unknown): Promise<FeatureResponse> {
			const validatedData = createFeatureSchema.parse(data);
			return apiFetch<FeatureResponse>(fetch, '/api/features', {
				method: 'POST',
				body: JSON.stringify(validatedData)
			});
		}
	};
}
```

### 3. Add to Main Client

```typescript
// src/lib/api/client.ts
import { createFeaturesApi } from './features';

export function createApiClient(fetch: typeof globalThis.fetch) {
	return {
		auth: createAuthApi(fetch),
		items: createItemsApi(fetch),
		features: createFeaturesApi(fetch) // Add new API
	};
}
```

### 4. Create Backend API Route

```typescript
// src/routes/api/features/+server.ts
import { createFeatureSchema } from '$lib/types/features.schemas';
import { ApiError, ApiSuccess } from '$lib/server/errors';
import { withApiLogging } from '$lib/server/logger/middleware';

export async function POST(event) {
	return withApiLogging(
		event,
		async ({ requestId }) => {
			const body = await event.request.json();
			const result = createFeatureSchema.safeParse(body);

			if (!result.success) {
				return ApiError.fromZod(result.error, requestId);
			}

			const [feature] = await db.insert(features).values(result.data).returning();

			return ApiSuccess.created(feature, { requestId });
		},
		{ operation: 'CREATE_FEATURE', schema: 'app' }
	);
}
```

## Migration from Raw Fetch

### Checklist

- [ ] Identify all `fetch('/api/...')` calls in `+page.server.ts` files
- [ ] Import `createApiClient` from `$lib/api/client`
- [ ] Create API client: `const api = createApiClient(fetch)`
- [ ] Replace `fetch()` with typed API call
- [ ] Remove manual `response.json()` calls
- [ ] Remove manual error handling (client handles it)
- [ ] Update type annotations to use schema-inferred types
- [ ] Test the endpoint

## Error Handling in API Client

The base `apiFetch` function automatically:

1. Sets `Content-Type: application/json`
2. Checks `response.ok`
3. Parses JSON response
4. Throws errors with message from API

```typescript
// src/lib/api/base.ts
export async function apiFetch<T>(
	fetch: typeof globalThis.fetch,
	url: string,
	init?: RequestInit
): Promise<T> {
	const response = await fetch(url, {
		...init,
		headers: {
			'Content-Type': 'application/json',
			...init?.headers
		}
	});

	if (!response.ok) {
		const error = await response.json().catch(() => ({ message: 'Request failed' }));
		throw new Error(error.message || `API error: ${response.status}`);
	}

	return response.json() as Promise<T>;
}
```

## Query String Building

Use `buildQueryString` helper for type-safe URL params:

```typescript
import { buildQueryString } from '$lib/api/base';

const params = { limit: 20, offset: 0 };
const queryString = buildQueryString(params);
// Returns: "?limit=20&offset=0"
```
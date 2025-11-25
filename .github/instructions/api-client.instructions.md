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
	const listings = await api.listings.getAll({ limit: 10 });
	const categories = await api.categories.getAll({ includeChildren: true });

	// Parallel fetching for better performance
	const [userData, favorites] = await Promise.all([api.users.me(), api.favorites.getAll()]);

	return { listings, categories, userData, favorites };
};
```

## API Client Structure

Located in `src/lib/api/`:

- `client.ts` - Factory function that creates API client
- `base.ts` - Base fetch wrapper with error handling
- `auth.ts` - Authentication endpoints
- `listings.ts` - Listings CRUD operations
- `categories.ts` - Categories endpoints
- `locations.ts` - Locations endpoints
- `favorites.ts` - Favorites endpoints

## How API Methods Work

**All API methods validate input** before sending:

```typescript
// src/lib/api/listings.ts
export function createListingsApi(fetch: typeof globalThis.fetch) {
	return {
		async create(data: unknown): Promise<ListingDetailResponse> {
			// Validates using createListingSchema before sending
			const validatedData = createListingSchema.parse(data);

			return apiFetch<ListingDetailResponse>(fetch, '/api/listings', {
				method: 'POST',
				body: JSON.stringify(validatedData)
			});
		},

		async getAll(params?: ListingQuery): Promise<ApiListingsResponse> {
			const validatedParams = params ? listingQuerySchema.parse(params) : {};
			const queryString = buildQueryString(validatedParams);
			return apiFetch<ApiListingsResponse>(fetch, `/api/listings${queryString}`);
		}
	};
}
```

## Adding New API Endpoints

### 1. Create Zod Schemas

```typescript
// src/lib/types/comments.schemas.ts
export const createCommentSchema = z.object({
	listingId: uuidSchema,
	content: z.string().min(1).max(500)
});

export const commentResponseSchema = z.object({
	id: uuidSchema,
	listingId: uuidSchema,
	userId: uuidSchema,
	content: z.string(),
	createdAt: z.coerce.date()
});

export type CreateComment = z.infer<typeof createCommentSchema>;
export type CommentResponse = z.infer<typeof commentResponseSchema>;
```

### 2. Create API Client Module

```typescript
// src/lib/api/comments.ts
import { createCommentSchema, type CommentResponse } from '$lib/types/comments.schemas';
import { apiFetch } from './base';

export function createCommentsApi(fetch: typeof globalThis.fetch) {
	return {
		async create(data: unknown): Promise<CommentResponse> {
			const validatedData = createCommentSchema.parse(data);
			return apiFetch<CommentResponse>(fetch, '/api/comments', {
				method: 'POST',
				body: JSON.stringify(validatedData)
			});
		},

		async getByListing(listingId: string): Promise<CommentResponse[]> {
			return apiFetch<CommentResponse[]>(fetch, `/api/comments?listingId=${listingId}`);
		}
	};
}
```

### 3. Add to Main Client

```typescript
// src/lib/api/client.ts
import { createCommentsApi } from './comments';

export function createApiClient(fetch: typeof globalThis.fetch) {
	return {
		auth: createAuthApi(fetch),
		listings: createListingsApi(fetch),
		categories: createCategoriesApi(fetch),
		locations: createLocationsApi(fetch),
		favorites: createFavoritesApi(fetch),
		comments: createCommentsApi(fetch) // Add new API
	};
}
```

### 4. Create Backend API Route

```typescript
// src/routes/api/comments/+server.ts
import { createCommentSchema } from '$lib/types/comments.schemas';
import { ApiError, ApiSuccess } from '$lib/server/errors';
import { withApiLogging } from '$lib/server/logger/middleware';

export async function POST(event) {
	return withApiLogging(
		event,
		async ({ requestId }) => {
			const body = await event.request.json();
			const result = createCommentSchema.safeParse(body);

			if (!result.success) {
				return ApiError.fromZod(result.error, requestId);
			}

			// Create comment in database
			const [comment] = await db.insert(comments).values(result.data).returning();

			return ApiSuccess.created(comment, { requestId });
		},
		{ operation: 'CREATE_COMMENT', schema: 'app' }
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

### Example Migration

**Before (raw fetch):**

```typescript
export const load: PageServerLoad = async ({ fetch, params }) => {
	const response = await fetch(`/api/listings/${params.id}`);
	if (!response.ok) {
		throw error(404, 'Listing not found');
	}
	const listing = await response.json();
	return { listing };
};
```

**After (API client):**

```typescript
import { createApiClient } from '$lib/api/client';

export const load: PageServerLoad = async ({ fetch, params }) => {
	const api = createApiClient(fetch);
	const listing = await api.listings.getById(params.id);
	return { listing };
};
```

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

const params = { limit: 20, offset: 0, categoryId: '123' };
const queryString = buildQueryString(params);
// Returns: "?limit=20&offset=0&categoryId=123"
```

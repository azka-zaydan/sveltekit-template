import { db } from '$lib/server/db';
import { items } from '$lib/server/db/schema';
import { ApiError, ApiSuccess } from '$lib/server/errors';
import { withApiLogging } from '$lib/server/logger/middleware';
import { createItemSchema, itemQuerySchema } from '$lib/types/app.schemas';
import type { RequestEvent } from '@sveltejs/kit';
import { desc, eq } from 'drizzle-orm';

export async function GET(event: RequestEvent) {
	return withApiLogging(
		event,
		async ({ requestId }) => {
			const query = Object.fromEntries(event.url.searchParams);
			const parsed = itemQuerySchema.safeParse(query);

			if (!parsed.success) {
				return ApiError.fromZod(parsed.error, requestId);
			}

			const { limit, offset, userId } = parsed.data;

			let queryBuilder = db.select().from(items).limit(limit).offset(offset).orderBy(desc(items.createdAt));

			if (userId) {
				queryBuilder = queryBuilder.where(eq(items.userId, userId));
			}

			const result = await queryBuilder;

			return ApiSuccess.ok({ items: result }, { requestId });
		},
		{ operation: 'LIST_ITEMS', schema: 'app' }
	);
}

export async function POST(event: RequestEvent) {
	return withApiLogging(
		event,
		async ({ requestId, userId }) => {
			if (!userId) {
				return ApiError.unauthorized('Authentication required', requestId);
			}

			const body = await event.request.json();
			const parsed = createItemSchema.safeParse(body);

			if (!parsed.success) {
				return ApiError.fromZod(parsed.error, requestId);
			}

			const [item] = await db
				.insert(items)
				.values({
					...parsed.data,
					userId
				})
				.returning();

			return ApiSuccess.created({ item }, { requestId });
		},
		{ operation: 'CREATE_ITEM', schema: 'app' }
	);
}

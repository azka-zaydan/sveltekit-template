import type { PgDatabase } from 'drizzle-orm/pg-core';
import { log, logSlowQuery } from './index';

/**
 * Wrapper for Drizzle queries that automatically logs slow queries
 * and tracks query performance
 *
 * @example
 * ```typescript
 * import { db } from '$lib/server/db';
 * import { withQueryLogging } from '$lib/server/logger/db';
 *
 * const users = await withQueryLogging(
 *   'get_active_users',
 *   () => db.select().from(users).where(eq(users.active, true)),
 *   { requestId: event.locals.requestId, schema: 'auth' }
 * );
 * ```
 */
export async function withQueryLogging<T>(
	queryName: string,
	query: () => Promise<T>,
	options?: {
		requestId?: string;
		schema?: 'auth' | 'app' | 'master' | 'public';
		slowThreshold?: number;
		meta?: Record<string, unknown>;
	}
): Promise<T> {
	const startTime = performance.now();
	const slowThreshold = options?.slowThreshold || 1000;

	try {
		const result = await query();
		const duration = Math.round(performance.now() - startTime);

		// Log slow queries
		logSlowQuery(queryName, duration, slowThreshold);

		// Always log in debug mode for development
		log.debug(`Database query: ${queryName}`, {
			operation: 'DB_QUERY',
			queryName,
			duration,
			requestId: options?.requestId,
			schema: options?.schema,
			...options?.meta
		});

		return result;
	} catch (error) {
		const duration = Math.round(performance.now() - startTime);

		log.error(`Database query failed: ${queryName}`, {
			operation: 'DB_QUERY_FAILED',
			queryName,
			duration,
			requestId: options?.requestId,
			schema: options?.schema,
			error: error instanceof Error ? error.message : 'Unknown error',
			stack: error instanceof Error ? error.stack : undefined,
			...options?.meta
		});

		throw error;
	}
}

/**
 * Create a logged database client that wraps all queries with logging
 *
 * @example
 * ```typescript
 * import { db } from '$lib/server/db';
 * import { createLoggedDb } from '$lib/server/logger/db';
 *
 * export async function load({ locals }) {
 *   const loggedDb = createLoggedDb(db, {
 *     requestId: locals.requestId,
 *     schema: 'app'
 *   });
 *
 *   // All queries through loggedDb will be automatically logged
 *   const listings = await loggedDb.select().from(listings);
 * }
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createLoggedDb<TDatabase extends PgDatabase<any, any, any>>(
	db: TDatabase,
	options?: {
		requestId?: string;
		schema?: 'auth' | 'app' | 'master' | 'public';
		slowThreshold?: number;
	}
): TDatabase {
	return new Proxy(db, {
		get(target, prop, receiver) {
			const original = Reflect.get(target, prop, receiver);

			// Only wrap methods that return promises (query methods)
			if (typeof original === 'function') {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				return function (this: any, ...args: any[]) {
					const result = original.apply(this, args);

					// If it's a promise (query execution), wrap it with logging
					if (result && typeof result.then === 'function') {
						return withQueryLogging(`db.${String(prop)}`, () => result, options);
					}

					return result;
				};
			}

			return original;
		}
	}) as TDatabase;
} /**
 * Helper for logging database transactions
 * Wraps Drizzle's db.transaction() with automatic logging
 *
 * @example
 * ```typescript
 * import { db } from '$lib/server/db';
 *
 * const result = await logTransaction(db, 'create_listing_with_images', async (tx) => {
 *   const listing = await tx.insert(listings).values(data).returning();
 *   await tx.insert(listingImages).values(images);
 *   return listing;
 * }, { requestId, schema: 'app' });
 * ```
 */
export async function logTransaction<T>(
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	db: PgDatabase<any, any, any>,
	transactionName: string,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	transaction: (tx: any) => Promise<T>,
	options?: {
		requestId?: string;
		schema?: 'auth' | 'app' | 'master' | 'public';
		meta?: Record<string, unknown>;
	}
): Promise<T> {
	const startTime = performance.now();

	log.debug(`Transaction started: ${transactionName}`, {
		operation: 'DB_TRANSACTION_START',
		transactionName,
		requestId: options?.requestId,
		schema: options?.schema,
		...options?.meta
	});

	try {
		// Properly wrap db.transaction() to provide tx parameter
		const result = await db.transaction(async (tx) => {
			return await transaction(tx);
		});
		const duration = Math.round(performance.now() - startTime);

		log.info(`Transaction completed: ${transactionName}`, {
			operation: 'DB_TRANSACTION_COMPLETE',
			transactionName,
			duration,
			requestId: options?.requestId,
			schema: options?.schema,
			...options?.meta
		});

		return result;
	} catch (error) {
		const duration = Math.round(performance.now() - startTime);

		log.error(`Transaction failed: ${transactionName}`, {
			operation: 'DB_TRANSACTION_FAILED',
			transactionName,
			duration,
			requestId: options?.requestId,
			schema: options?.schema,
			error: error instanceof Error ? error.message : 'Unknown error',
			stack: error instanceof Error ? error.stack : undefined,
			...options?.meta
		});

		throw error;
	}
}

/**
 * Master Schema - Reference data
 * Schema: master
 */
import { pgSchema, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

export const masterSchema = pgSchema('master');

/**
 * Categories table - Hierarchical categories example
 */
export const categories = masterSchema.table('categories', {
	id: uuid('id').defaultRandom().primaryKey(),
	name: varchar('name', { length: 100 }).notNull(),
	slug: varchar('slug', { length: 100 }).unique().notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

export type Category = typeof categories.$inferSelect;
/**
 * App Schema - Application transactional data
 * Schema: app
 */
import { boolean, pgSchema, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { user } from './auth.schema';

export const appSchema = pgSchema('app');

/**
 * Items table - Generic resource example
 */
export const items = appSchema.table('items', {
	id: uuid('id').defaultRandom().primaryKey(),
	userId: uuid('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	name: varchar('name', { length: 255 }).notNull(),
	description: text('description'),
	isActive: boolean('is_active').default(true).notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export type Item = typeof items.$inferSelect;
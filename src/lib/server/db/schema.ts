import { integer, pgSchema, text, timestamp } from 'drizzle-orm/pg-core';

// Define auth schema
export const authSchema = pgSchema('auth');

// User table in auth schema
export const user = authSchema.table('user', {
	id: text('id').primaryKey(),
	age: integer('age'),
	username: text('username').notNull().unique(),
	passwordHash: text('password_hash').notNull()
});

// Session table in auth schema
export const session = authSchema.table('session', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull()
});

export type Session = typeof session.$inferSelect;

export type User = typeof user.$inferSelect;

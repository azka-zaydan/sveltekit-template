/**
 * Auth Schema - User authentication and session management
 * Schema: auth
 */

import { boolean, pgSchema, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

export const authSchema = pgSchema('auth');

/**
 * User table - Core user information
 */
export const user = authSchema.table('user', {
	id: uuid('id').primaryKey(),
	email: varchar('email', { length: 255 }).notNull().unique(),
	name: varchar('name', { length: 255 }),
	phoneNumber: varchar('phone_number', { length: 20 }),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull(),
	username: text('username').notNull().unique(),
	passwordHash: text('password_hash').notNull()
});

/**
 * Session table - User session management (Lucia)
 */
export const session = authSchema.table('session', {
	id: text('id').primaryKey(),
	userId: uuid('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull()
});

/**
 * Phone Verifications table - OTP and phone verification codes
 */
export const phoneVerifications = authSchema.table('phone_verifications', {
	id: uuid('id').defaultRandom().primaryKey(),
	userId: uuid('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	phoneNumber: varchar('phone_number', { length: 20 }).notNull(),
	code: varchar('code', { length: 10 }).notNull(),
	verificationType: varchar('verification_type', { length: 20 }).notNull().default('otp'),
	isUsed: boolean('is_used').default(false).notNull(),
	expiresAt: timestamp('expires_at').notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

// Type exports
export type Session = typeof session.$inferSelect;
export type User = typeof user.$inferSelect;

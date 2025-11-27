/**
 * App Data Zod Schemas
 */
import { z } from 'zod';
import { limitSchema, offsetSchema, uuidSchema } from './common.schemas';

// Items
export const itemSchema = z.object({
	id: uuidSchema,
	userId: uuidSchema,
	name: z.string().min(1).max(255),
	description: z.string().optional(),
	isActive: z.boolean().default(true),
	createdAt: z.date(),
	updatedAt: z.date()
});

export const createItemSchema = z.object({
	name: z.string().min(1).max(255, { error: 'Name must be between 1 and 255 characters' }),
	description: z.string().optional()
});

export const updateItemSchema = createItemSchema.partial().extend({
	isActive: z.boolean().optional()
});

export const itemQuerySchema = z.object({
	limit: limitSchema,
	offset: offsetSchema,
	userId: uuidSchema.optional()
});

export type Item = z.infer<typeof itemSchema>;
export type CreateItem = z.infer<typeof createItemSchema>;
export type UpdateItem = z.infer<typeof updateItemSchema>;
export type ItemQuery = z.infer<typeof itemQuerySchema>;

/**
 * Master Data Zod Schemas
 */
import { z } from 'zod';
import { uuidSchema } from './common.schemas';

// Categories
export const categorySchema = z.object({
	id: uuidSchema,
	name: z.string().min(1).max(100),
	slug: z.string().min(1).max(100),
	createdAt: z.date()
});

export type Category = z.infer<typeof categorySchema>;
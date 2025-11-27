/**
 * Master data schemas
 * For categories, locations, and other reference/lookup data
 */

import { z } from 'zod';
import { slugSchema, uuidSchema } from './common.schemas';

// ============================================================================
// CATEGORY SCHEMAS
// ============================================================================

/**
 * Base category schema
 */
export const categorySchema = z.object({
	id: uuidSchema,
	name: z.string().min(1).max(100),
	slug: slugSchema,
	parentId: uuidSchema.nullable(),
	createdAt: z.date()
});

/**
 * Category response (for API endpoints)
 */
export const categoryResponseSchema = categorySchema;

/**
 * Category with children (hierarchical)
 */
export const categoryWithChildrenSchema = categorySchema.extend({
	children: z.lazy(() => categorySchema.array())
});

// ============================================================================
// LOCATION SCHEMAS
// ============================================================================

/**
 * Base location schema
 */
export const locationSchema = z.object({
	id: uuidSchema,
	city: z.string().min(1).max(100),
	state: z.string().min(1).max(50),
	country: z.string().default('USA'),
	slug: slugSchema,
	createdAt: z.date()
});

/**
 * Location response (for API endpoints)
 */
export const locationResponseSchema = locationSchema;

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type Category = z.infer<typeof categorySchema>;
export type CategoryResponse = z.infer<typeof categoryResponseSchema>;
export type CategoryWithChildren = z.infer<typeof categoryWithChildrenSchema>;

export type Location = z.infer<typeof locationSchema>;
export type LocationResponse = z.infer<typeof locationResponseSchema>;

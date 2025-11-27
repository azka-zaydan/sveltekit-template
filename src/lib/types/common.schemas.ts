/**
 * Common validation schemas and reusable primitives
 * Used across all entity schemas
 */

import { z } from 'zod';

// ============================================================================
// PRIMITIVES
// ============================================================================

/**
 * UUID v4 string validation
 */
export const uuidSchema = z.uuid({ message: 'Invalid UUID format' });

/**
 * Email validation with proper RFC 5322 compliance
 */
export const emailSchema = z
	.string()
	.email({ message: 'Invalid email format' })
	.max(255, { error: 'Email must be less than 255 characters' })
	.toLowerCase()
	.trim();

/**
 * Phone number validation (US format, flexible)
 * Accepts: (555) 123-4567, 555-123-4567, 5551234567, +15551234567
 */
export const phoneNumberSchema = z
	.string()
	.min(1, { error: 'Phone number is required' })
	.max(20, { error: 'Phone number must be less than 20 characters' })
	.regex(/^[+]?[(]?[0-9]{1,3}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,9}$/, {
		error: 'Invalid phone number format'
	})
	.trim();

/**
 * Optional phone number (allows null/undefined)
 */
export const optionalPhoneNumberSchema = phoneNumberSchema.optional().nullable();

/**
 * Username validation
 * 3-50 characters, alphanumeric with underscores and hyphens
 */
export const usernameSchema = z
	.string()
	.min(3, { error: 'Username must be at least 3 characters' })
	.max(50, { error: 'Username must be less than 50 characters' })
	.regex(/^[a-zA-Z0-9_-]+$/, {
		error: 'Username can only contain letters, numbers, underscores, and hyphens'
	})
	.trim();

/**
 * Password validation with strength requirements
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
export const passwordSchema = z
	.string()
	.min(8, { error: 'Password must be at least 8 characters' })
	.max(255, { error: 'Password must be less than 255 characters' })
	.regex(/[A-Z]/, { error: 'Password must contain at least one uppercase letter' })
	.regex(/[a-z]/, { error: 'Password must contain at least one lowercase letter' })
	.regex(/[0-9]/, { error: 'Password must contain at least one number' })
	.regex(/[^A-Za-z0-9]/, { error: 'Password must contain at least one special character' });

/**
 * Name validation (user's display name)
 */
export const nameSchema = z
	.string()
	.max(255, { error: 'Name must be less than 255 characters' })
	.trim()
	.optional();

/**
 * URL validation
 */
export const urlSchema = z
	.string()
	.url({ message: 'Invalid URL format' })
	.max(500, { error: 'URL must be less than 500 characters' });

/**
 * Slug validation (URL-friendly identifier)
 * Lowercase letters, numbers, and hyphens only
 */
export const slugSchema = z
	.string()
	.min(1, { error: 'Slug is required' })
	.max(150, { error: 'Slug must be less than 150 characters' })
	.regex(/^[a-z0-9-]+$/, { error: 'Slug can only contain lowercase letters, numbers, and hyphens' })
	.trim();

// ============================================================================
// NUMERIC TYPES
// ============================================================================

/**
 * Price validation (decimal with 2 decimal places)
 * Allows null for items without a price (e.g., "free", "trade")
 */
export const priceSchema = z
	.string()
	.regex(/^\d+(\.\d{1,2})?$/, {
		error: 'Price must be a valid decimal number with up to 2 decimal places'
	})
	.refine((val) => parseFloat(val) >= 0, { error: 'Price must be non-negative' })
	.refine((val) => parseFloat(val) <= 99999999.99, { error: 'Price must be less than 100 million' })
	.optional()
	.nullable();

/**
 * Positive integer validation
 */
export const positiveIntSchema = z.number().int().positive();

/**
 * Non-negative integer validation
 */
export const nonNegativeIntSchema = z.number().int().min(0);

// ============================================================================
// PAGINATION & FILTERING
// ============================================================================

/**
 * Pagination limit parameter
 * Default: 20, Min: 1, Max: 100
 */
export const limitSchema = z.coerce
	.number()
	.int()
	.min(1, { error: 'Limit must be at least 1' })
	.max(100, { error: 'Limit cannot exceed 100' })
	.default(20);

/**
 * Pagination offset parameter
 * Default: 0, Min: 0
 */
export const offsetSchema = z.coerce
	.number()
	.int()
	.min(0, { error: 'Offset must be non-negative' })
	.default(0);

/**
 * Search query string
 */
export const searchQuerySchema = z
	.string()
	.max(200, { error: 'Search query must be less than 200 characters' })
	.trim()
	.optional();

/**
 * Sort order
 */
export const sortOrderSchema = z.enum(['asc', 'desc']).default('desc');

/**
 * Boolean query parameter (accepts "true", "false", "1", "0")
 */
export const booleanQuerySchema = z
	.union([z.boolean(), z.enum(['true', 'false', '1', '0'])])
	.transform((val) => {
		if (typeof val === 'boolean') return val;
		return val === 'true' || val === '1';
	})
	.optional();

// ============================================================================
// DATE/TIME
// ============================================================================

/**
 * ISO 8601 date string validation
 */
export const isoDateSchema = z.string().datetime({ message: 'Invalid ISO 8601 date format' });

/**
 * Date object validation
 */
export const dateSchema = z.date();

/**
 * Future date validation
 */
export const futureDateSchema = z.date().refine((date) => date > new Date(), {
	error: 'Date must be in the future'
});

// ============================================================================
// TEXT CONTENT
// ============================================================================

/**
 * Short text field (titles, names, etc.)
 */
export const shortTextSchema = z
	.string()
	.min(1, { error: 'This field is required' })
	.max(255, { error: 'Text must be less than 255 characters' })
	.trim();

/**
 * Long text field (descriptions, comments, etc.)
 */
export const longTextSchema = z
	.string()
	.min(1, { error: 'This field is required' })
	.max(10000, { error: 'Text must be less than 10,000 characters' })
	.trim();

/**
 * Optional long text
 */
export const optionalLongTextSchema = longTextSchema.optional().nullable();

// ============================================================================
// IMAGE/FILE VALIDATION
// ============================================================================

/**
 * Image URL validation
 */
export const imageUrlSchema = z
	.string()
	.url({ message: 'Invalid image URL' })
	.max(500, { error: 'Image URL must be less than 500 characters' })
	.refine(
		(url) => {
			// Basic image extension check
			const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg)$/i;
			return imageExtensions.test(url);
		},
		{ error: 'URL must point to a valid image file' }
	);

/**
 * Display order for sorted items (images, etc.)
 */
export const displayOrderSchema = z.number().int().min(0).default(0);

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Create an optional version of any schema
 */
export function makeOptional<T extends z.ZodTypeAny>(schema: T) {
	return schema.optional().nullable();
}

/**
 * Create a partial version of any object schema (all fields optional)
 */
export function makePartial<T extends z.ZodObject<z.ZodRawShape>>(schema: T) {
	return schema.partial();
}

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type UUID = z.infer<typeof uuidSchema>;
export type Email = z.infer<typeof emailSchema>;
export type PhoneNumber = z.infer<typeof phoneNumberSchema>;
export type Username = z.infer<typeof usernameSchema>;
export type Password = z.infer<typeof passwordSchema>;
export type Slug = z.infer<typeof slugSchema>;
export type Price = z.infer<typeof priceSchema>;
export type SortOrder = z.infer<typeof sortOrderSchema>;

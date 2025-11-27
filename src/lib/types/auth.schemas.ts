/**
 * Authentication schemas
 * Validation for User, Session, and PhoneVerification tables (auth schema)
 */

import { z } from 'zod';
import {
	emailSchema,
	nameSchema,
	optionalPhoneNumberSchema,
	passwordSchema,
	phoneNumberSchema,
	usernameSchema,
	uuidSchema
} from './common.schemas';

// ============================================================================
// USER SCHEMAS
// ============================================================================

/**
 * Base user schema (all fields from database)
 */
export const userSchema = z.object({
	id: uuidSchema,
	email: emailSchema,
	name: nameSchema.optional(),
	phoneNumber: optionalPhoneNumberSchema,
	createdAt: z.date(),
	updatedAt: z.date(),
	username: usernameSchema,
	passwordHash: z.string()
});

/**
 * User registration schema (input validation)
 */
export const registerUserSchema = z.object({
	username: usernameSchema,
	email: emailSchema,
	password: passwordSchema,
	name: nameSchema.optional()
});

/**
 * User login schema
 */
export const loginUserSchema = z.object({
	email: emailSchema,
	password: z.string().min(1, 'Password is required')
});

/**
 * User update schema (all fields optional except at least one must be present)
 */
export const updateUserSchema = z
	.object({
		email: emailSchema.optional(),
		name: nameSchema.optional(),
		phoneNumber: optionalPhoneNumberSchema,
		username: usernameSchema.optional()
	})
	.refine((data) => Object.values(data).some((val) => val !== undefined && val !== null), {
		message: 'At least one field must be provided for update'
	});

/**
 * Password change schema
 */
export const changePasswordSchema = z
	.object({
		currentPassword: z.string().min(1, 'Current password is required'),
		newPassword: passwordSchema,
		confirmPassword: z.string().min(1, 'Password confirmation is required')
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: 'Passwords do not match',
		path: ['confirmPassword']
	})
	.refine((data) => data.currentPassword !== data.newPassword, {
		message: 'New password must be different from current password',
		path: ['newPassword']
	});

/**
 * User response schema (safe for API responses - no password hash)
 */
export const userResponseSchema = userSchema.omit({ passwordHash: true });

/**
 * Public user profile schema (minimal info for listings, etc.)
 */
export const publicUserSchema = z.object({
	id: uuidSchema,
	username: usernameSchema,
	name: nameSchema,
	createdAt: z.date()
});

// ============================================================================
// SESSION SCHEMAS
// ============================================================================

/**
 * Session schema
 */
export const sessionSchema = z.object({
	id: z.string().min(1, 'Session ID is required'),
	userId: uuidSchema,
	expiresAt: z.date()
});

/**
 * Session with user data (for authenticated requests)
 */
export const sessionWithUserSchema = z.object({
	session: sessionSchema,
	user: userResponseSchema
});

// ============================================================================
// PHONE VERIFICATION SCHEMAS
// ============================================================================

/**
 * Verification type enum
 */
export const verificationTypeSchema = z.enum(['otp', 'magic_link'], {
	error: 'Verification type must be either "otp" or "magic_link"'
});

/**
 * Phone verification schema
 */
export const phoneVerificationSchema = z.object({
	id: uuidSchema,
	userId: uuidSchema,
	phoneNumber: phoneNumberSchema,
	code: z.string().min(4).max(10),
	verificationType: verificationTypeSchema,
	isUsed: z.boolean().default(false),
	expiresAt: z.date(),
	createdAt: z.date()
});

/**
 * Request phone verification schema (initiate verification)
 */
export const requestPhoneVerificationSchema = z.object({
	phoneNumber: phoneNumberSchema,
	verificationType: verificationTypeSchema.default('otp')
});

/**
 * Verify phone code schema
 */
export const verifyPhoneCodeSchema = z.object({
	phoneNumber: phoneNumberSchema,
	code: z
		.string()
		.min(4, 'Verification code must be at least 4 characters')
		.max(10, 'Verification code must be less than 10 characters')
		.trim()
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type User = z.infer<typeof userSchema>;
export type RegisterUser = z.infer<typeof registerUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type ChangePassword = z.infer<typeof changePasswordSchema>;
export type UserResponse = z.infer<typeof userResponseSchema>;
export type PublicUser = z.infer<typeof publicUserSchema>;

export type Session = z.infer<typeof sessionSchema>;
export type SessionWithUser = z.infer<typeof sessionWithUserSchema>;

export type VerificationType = z.infer<typeof verificationTypeSchema>;
export type PhoneVerification = z.infer<typeof phoneVerificationSchema>;
export type RequestPhoneVerification = z.infer<typeof requestPhoneVerificationSchema>;
export type VerifyPhoneCode = z.infer<typeof verifyPhoneCodeSchema>;

// ============================================================================
// API RESPONSE SCHEMAS (matching actual API endpoint responses)
// ============================================================================

/**
 * POST /api/auth/register response
 * POST /api/auth/login response
 */
export const apiAuthResponseSchema = z.object({
	user: z.object({
		id: uuidSchema,
		username: usernameSchema,
		email: emailSchema
	})
});

export type ApiAuthResponse = z.infer<typeof apiAuthResponseSchema>;

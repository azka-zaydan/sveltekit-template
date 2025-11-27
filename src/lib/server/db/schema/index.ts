/**
 * Schema Barrel File
 * Re-exports all schema definitions and types for easy importing
 */

// Re-export schema instances
export { appSchema } from './app.schema';
export { authSchema } from './auth.schema';
export { masterSchema } from './master.schema';

// Re-export all tables from auth schema
export { phoneVerifications, session, user } from './auth.schema';

// Re-export all tables from master schema
export { categories } from './master.schema';

// Re-export all tables from app schema
export { items } from './app.schema';

// Re-export types
export type { Session, User } from './auth.schema';
export type { Item } from './app.schema';
export type { Category } from './master.schema';
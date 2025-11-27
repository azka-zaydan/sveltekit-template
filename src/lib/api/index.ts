/**
 * API client exports
 *
 * This module exports both the factory function and individual API creators
 * for flexibility in how the API client is used.
 */

export { createAuthApi } from './auth';
export { apiFetch, buildQueryString } from './base';
export { createApiClient } from './client';

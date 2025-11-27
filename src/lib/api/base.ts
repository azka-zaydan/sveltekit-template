/**
 * Base utilities for API client
 */

/**
 * Base fetch wrapper with error handling
 * Automatically unwraps ApiSuccess responses
 */
export async function apiFetch<T>(
	fetch: typeof globalThis.fetch,
	url: string,
	init?: RequestInit
): Promise<T> {
	const response = await fetch(url, {
		...init,
		headers: {
			'Content-Type': 'application/json',
			...init?.headers
		}
	});

	if (!response.ok) {
		const error = await response.json().catch(() => ({
			detail: 'Request failed',
			title: 'Request failed'
		}));
		// Use 'detail' field from ApiError responses, fallback to 'message' or status
		const errorMessage =
			error.detail ||
			error.message ||
			error.title ||
			`Request failed with status ${response.status}`;
		throw new Error(errorMessage);
	}

	// Handle 204 No Content - no body to parse
	if (response.status === 204) {
		return undefined as T;
	}

	const json = await response.json();

	// Unwrap ApiSuccess response structure { success: true, data: T }
	if (json && typeof json === 'object' && 'success' in json && 'data' in json) {
		return json.data as T;
	}

	return json as T;
}

/**
 * Build query string from object
 */
export function buildQueryString(
	params?: Record<string, string | number | boolean | undefined>
): string {
	if (!params) return '';

	const searchParams = new URLSearchParams();
	Object.entries(params).forEach(([key, value]) => {
		if (value !== undefined && value !== null) {
			searchParams.append(key, String(value));
		}
	});

	const queryString = searchParams.toString();
	return queryString ? `?${queryString}` : '';
}

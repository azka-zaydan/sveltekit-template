<script lang="ts">
	let apiResponse = $state<{ status: number; data: unknown } | null>(null);
	let isLoading = $state(false);

	async function testApi(type: string, method: 'GET' | 'POST' = 'GET', body?: unknown) {
		isLoading = true;
		apiResponse = null;

		try {
			const url = method === 'GET' ? `/demo/logger/api/test?type=${type}` : '/demo/logger/api/test';

			const options: RequestInit = {
				method,
				headers: method === 'POST' ? { 'Content-Type': 'application/json' } : undefined,
				body: method === 'POST' && body ? JSON.stringify(body) : undefined
			};

			const response = await fetch(url, options);
			const data = await response.json();

			apiResponse = {
				status: response.status,
				data
			};

			console.log(`API Response (${response.status}):`, data);
		} catch (error) {
			console.error('API Error:', error);
			apiResponse = {
				status: 0,
				data: { error: 'Network error or invalid response' }
			};
		} finally {
			isLoading = false;
		}
	}

	function testValidation(valid: boolean) {
		const body = valid
			? {
					name: 'John Doe',
					email: 'john@example.com',
					age: 25
				}
			: {
					name: 'Jo', // Too short
					email: 'invalid-email', // Invalid format
					age: 15 // Too young
				};

		testApi('validation', 'POST', body);
	}
</script>

<div class="max-w-4xl mx-auto px-4 py-8">
	<h1 class="text-3xl font-bold mb-6">API Error Logging Demo</h1>

	<div class="space-y-6">
		<!-- Introduction -->
		<section class="border border-gray-300 p-6 bg-blue-50">
			<h2 class="text-xl font-bold mb-4">🔍 How to Use This Demo</h2>
			<ol class="list-decimal list-inside space-y-2 text-sm text-gray-700">
				<li>Open your browser's Developer Console (F12)</li>
				<li>Click any button below to trigger an API call</li>
				<li>Watch the console for structured log messages</li>
				<li>Check the response displayed on this page</li>
			</ol>
			<p class="text-sm text-gray-600 mt-4">
				<strong>Note:</strong> All logging happens automatically via the ApiError helper in
				<code class="bg-white px-1 py-0.5">$lib/server/errors.ts</code>
				and success helpers in
				<code class="bg-white px-1 py-0.5">$lib/server/responses.ts</code>
			</p>
		</section>

		<!-- Success Response -->
		<section class="border border-gray-300 p-6">
			<h2 class="text-xl font-bold mb-4">✅ Success Response (200)</h2>
			<p class="text-sm text-gray-600 mb-4">Returns sample data with success logging.</p>
			<button
				onclick={() => testApi('success')}
				disabled={isLoading}
				class="px-4 py-2 bg-green-700 text-white hover:bg-green-800 disabled:bg-gray-400 text-sm"
			>
				GET /api/test?type=success
			</button>
		</section>

		<!-- Validation Error -->
		<section class="border border-gray-300 p-6">
			<h2 class="text-xl font-bold mb-4">🔴 Validation Error (400) - Zod</h2>
			<p class="text-sm text-gray-600 mb-4">
				Submit invalid data to see field-level validation errors from Zod schema.
			</p>
			<div class="flex gap-2">
				<button
					onclick={() => testValidation(false)}
					disabled={isLoading}
					class="px-4 py-2 bg-red-700 text-white hover:bg-red-800 disabled:bg-gray-400 text-sm"
				>
					POST Invalid Data
				</button>
				<button
					onclick={() => testValidation(true)}
					disabled={isLoading}
					class="px-4 py-2 bg-green-700 text-white hover:bg-green-800 disabled:bg-gray-400 text-sm"
				>
					POST Valid Data
				</button>
			</div>
		</section>

		<!-- Unauthorized Error -->
		<section class="border border-gray-300 p-6">
			<h2 class="text-xl font-bold mb-4">🔒 Unauthorized Error (401)</h2>
			<p class="text-sm text-gray-600 mb-4">Requires authentication (logged with console.warn).</p>
			<button
				onclick={() => testApi('unauthorized')}
				disabled={isLoading}
				class="px-4 py-2 bg-yellow-700 text-white hover:bg-yellow-800 disabled:bg-gray-400 text-sm"
			>
				GET /api/test?type=unauthorized
			</button>
		</section>

		<!-- Forbidden Error -->
		<section class="border border-gray-300 p-6">
			<h2 class="text-xl font-bold mb-4">🚫 Forbidden Error (403)</h2>
			<p class="text-sm text-gray-600 mb-4">Insufficient permissions (logged with console.warn).</p>
			<button
				onclick={() => testApi('forbidden')}
				disabled={isLoading}
				class="px-4 py-2 bg-orange-700 text-white hover:bg-orange-800 disabled:bg-gray-400 text-sm"
			>
				GET /api/test?type=forbidden
			</button>
		</section>

		<!-- Not Found Error -->
		<section class="border border-gray-300 p-6">
			<h2 class="text-xl font-bold mb-4">❓ Not Found Error (404)</h2>
			<p class="text-sm text-gray-600 mb-4">Resource doesn't exist (logged with console.warn).</p>
			<button
				onclick={() => testApi('notFound')}
				disabled={isLoading}
				class="px-4 py-2 bg-gray-700 text-white hover:bg-gray-800 disabled:bg-gray-400 text-sm"
			>
				GET /api/test?type=notFound
			</button>
		</section>

		<!-- Conflict Error -->
		<section class="border border-gray-300 p-6">
			<h2 class="text-xl font-bold mb-4">⚠️ Conflict Error (409)</h2>
			<p class="text-sm text-gray-600 mb-4">Resource already exists (logged with console.warn).</p>
			<button
				onclick={() => testApi('conflict')}
				disabled={isLoading}
				class="px-4 py-2 bg-blue-700 text-white hover:bg-blue-800 disabled:bg-gray-400 text-sm"
			>
				GET /api/test?type=conflict
			</button>
		</section>

		<!-- Internal Server Error -->
		<section class="border border-gray-300 p-6">
			<h2 class="text-xl font-bold mb-4">💥 Internal Server Error (500)</h2>
			<p class="text-sm text-gray-600 mb-4">
				Unexpected error (logged with <strong>console.error</strong>, not warn).
			</p>
			<button
				onclick={() => testApi('internal')}
				disabled={isLoading}
				class="px-4 py-2 bg-red-900 text-white hover:bg-red-950 disabled:bg-gray-400 text-sm"
			>
				GET /api/test?type=internal
			</button>
		</section>

		<!-- API Response Display -->
		{#if apiResponse}
			<section class="border border-gray-300 p-6 bg-gray-50">
				<h2 class="text-xl font-bold mb-4">API Response</h2>

				<div class="mb-2">
					<span class="text-sm font-bold">Status:</span>
					<span
						class="ml-2 px-2 py-1 text-xs font-mono"
						class:bg-green-100={apiResponse.status >= 200 && apiResponse.status < 300}
						class:bg-yellow-100={apiResponse.status >= 400 && apiResponse.status < 500}
						class:bg-red-100={apiResponse.status >= 500}
					>
						{apiResponse.status}
					</span>
				</div>

				<div>
					<span class="text-sm font-bold">Body:</span>
					<pre
						class="mt-2 p-4 bg-white border border-gray-300 text-xs overflow-x-auto">{JSON.stringify(
							apiResponse.data,
							null,
							2
						)}</pre>
				</div>
			</section>
		{/if}

		<!-- Code Example -->
		<section class="border border-gray-300 p-6">
			<h2 class="text-xl font-bold mb-4">📝 Code Example</h2>
			<p class="text-sm text-gray-600 mb-4">
				Here's how the API endpoint uses error handling with automatic logging:
			</p>

			<pre
				class="p-4 bg-gray-900 text-gray-100 text-xs overflow-x-auto rounded">{`// src/routes/demo/logger/api/test/+server.ts
import { ApiError } from '$lib/server/errors';
import { success, created } from '$lib/server/responses';

export const GET: RequestHandler = async ({ url }) => {
  const requestId = 'req_123'; // From hooks.server.ts in production
  const testType = url.searchParams.get('type');

  switch (testType) {
    case 'success':
      // Returns success response with optional message
      return success({ items: [...] }, 'Items retrieved');

    case 'unauthorized':
      // Automatically logs with console.warn()
      return ApiError.unauthorized('Login required', requestId);

    case 'internal':
      // Automatically logs with console.error()
      return ApiError.internal('Database failed', requestId);

    default:
      return ApiError.badRequest('Invalid type', undefined, requestId);
  }
};

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  const result = schema.safeParse(body);

  if (!result.success) {
    // Automatically extracts field errors and logs with console.warn()
    return ApiError.fromZod(result.error, requestId);
  }

  return created(result.data, 'Item created successfully');
};`}</pre>
		</section>

		<!-- Console Output Guide -->
		<section class="border border-gray-300 p-6 bg-yellow-50">
			<h2 class="text-xl font-bold mb-4">📊 What to Look for in Console</h2>
			<ul class="space-y-3 text-sm">
				<li>
					<strong>Validation errors:</strong>
					<code class="bg-white px-1 py-0.5">[Validation Error]</code> with errorCount and field names
				</li>
				<li>
					<strong>4xx errors (client errors):</strong>
					<code class="bg-white px-1 py-0.5">[API Error]</code>
					logged with <code class="bg-white px-1 py-0.5">console.warn()</code> (yellow in console)
				</li>
				<li>
					<strong>5xx errors (server errors):</strong>
					<code class="bg-white px-1 py-0.5">[API Error]</code>
					logged with <code class="bg-white px-1 py-0.5">console.error()</code> (red in console)
				</li>
				<li>
					<strong>Success responses:</strong>
					<code class="bg-white px-1 py-0.5">[API Success]</code> with response data
				</li>
				<li>
					Each log includes: <code class="bg-white px-1 py-0.5">requestId</code>,
					<code class="bg-white px-1 py-0.5">type</code>,
					<code class="bg-white px-1 py-0.5">status</code>, and
					<code class="bg-white px-1 py-0.5">detail</code>
				</li>
			</ul>
		</section>
	</div>
</div>

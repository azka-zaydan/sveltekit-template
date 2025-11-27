<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';
	import Navigation from '$lib/components/ui/layout/Navigation.svelte';

	let { form }: { form: ActionData } = $props();
</script>

<div class="max-w-4xl mx-auto px-4 py-8">
	<Navigation />
	<h1 class="text-3xl font-bold mb-6">Error Handling & Logging Demo</h1>

	<div class="space-y-8">
		<!-- Introduction -->
		<section class="border border-gray-300 p-6">
			<h2 class="text-xl font-bold mb-4">About This Demo</h2>
			<p class="text-sm text-gray-700 mb-4">
				This demonstrates the standardized error handling system with console-based logging. All
				errors are logged to the browser console with structured metadata.
			</p>
			<p class="text-sm text-gray-600">
				<strong>Check your browser console</strong> (F12) to see the logged errors when you trigger them.
			</p>
		</section>

		<!-- Validation Error Demo -->
		<section class="border border-gray-300 p-6">
			<h2 class="text-xl font-bold mb-4">1. Validation Error (400)</h2>
			<p class="text-sm text-gray-600 mb-4">
				Submit invalid data to see Zod validation errors with field-level feedback.
			</p>

			<form method="post" action="?/validateData" use:enhance class="space-y-4">
				<div>
					<label for="email" class="block text-sm font-medium mb-1">Email</label>
					<input
						id="email"
						name="email"
						type="text"
						class="w-full px-3 py-2 border border-gray-300 text-sm"
						placeholder="Enter email..."
					/>
					{#if form?.action === 'validateData' && form?.errors?.email}
						<p class="text-red-600 text-sm mt-1">{form.errors.email.join(', ')}</p>
					{/if}
				</div>

				<div>
					<label for="age" class="block text-sm font-medium mb-1">Age</label>
					<input
						id="age"
						name="age"
						type="number"
						class="w-full px-3 py-2 border border-gray-300 text-sm"
						placeholder="Enter age..."
					/>
					{#if form?.action === 'validateData' && form?.errors?.age}
						<p class="text-red-600 text-sm mt-1">{form.errors.age.join(', ')}</p>
					{/if}
				</div>

				<button
					type="submit"
					class="px-4 py-2 bg-purple-700 text-white hover:bg-purple-800 text-sm"
				>
					Submit (Try Empty or Invalid Data)
				</button>
			</form>

			{#if form?.action === 'validateData' && form?.success}
				<p class="text-green-600 text-sm mt-4">✓ Validation passed! Check console for log.</p>
			{/if}
		</section>

		<!-- Authentication Error Demo -->
		<section class="border border-gray-300 p-6">
			<h2 class="text-xl font-bold mb-4">2. Unauthorized Error (401)</h2>
			<p class="text-sm text-gray-600 mb-4">
				Simulate an authentication required error. Check console for warning log.
			</p>

			<form method="post" action="?/unauthorized" use:enhance>
				<button
					type="submit"
					class="px-4 py-2 bg-purple-700 text-white hover:bg-purple-800 text-sm"
				>
					Trigger Unauthorized Error
				</button>
			</form>

			{#if form?.action === 'unauthorized' && form?.error}
				<p class="text-red-600 text-sm mt-4">✗ {form.error}</p>
			{/if}
		</section>

		<!-- Forbidden Error Demo -->
		<section class="border border-gray-300 p-6">
			<h2 class="text-xl font-bold mb-4">3. Forbidden Error (403)</h2>
			<p class="text-sm text-gray-600 mb-4">
				Simulate insufficient permissions error. Check console for warning log.
			</p>

			<form method="post" action="?/forbidden" use:enhance>
				<button
					type="submit"
					class="px-4 py-2 bg-purple-700 text-white hover:bg-purple-800 text-sm"
				>
					Trigger Forbidden Error
				</button>
			</form>

			{#if form?.action === 'forbidden' && form?.error}
				<p class="text-red-600 text-sm mt-4">✗ {form.error}</p>
			{/if}
		</section>

		<!-- Not Found Error Demo -->
		<section class="border border-gray-300 p-6">
			<h2 class="text-xl font-bold mb-4">4. Not Found Error (404)</h2>
			<p class="text-sm text-gray-600 mb-4">
				Simulate a resource not found error. Check console for warning log.
			</p>

			<form method="post" action="?/notFound" use:enhance>
				<button
					type="submit"
					class="px-4 py-2 bg-purple-700 text-white hover:bg-purple-800 text-sm"
				>
					Trigger Not Found Error
				</button>
			</form>

			{#if form?.action === 'notFound' && form?.error}
				<p class="text-red-600 text-sm mt-4">✗ {form.error}</p>
			{/if}
		</section>

		<!-- Conflict Error Demo -->
		<section class="border border-gray-300 p-6">
			<h2 class="text-xl font-bold mb-4">5. Conflict Error (409)</h2>
			<p class="text-sm text-gray-600 mb-4">
				Simulate a duplicate resource conflict. Check console for warning log.
			</p>

			<form method="post" action="?/conflict" use:enhance>
				<button
					type="submit"
					class="px-4 py-2 bg-purple-700 text-white hover:bg-purple-800 text-sm"
				>
					Trigger Conflict Error
				</button>
			</form>

			{#if form?.action === 'conflict' && form?.error}
				<p class="text-red-600 text-sm mt-4">✗ {form.error}</p>
			{/if}
		</section>

		<!-- Internal Error Demo -->
		<section class="border border-gray-300 p-6">
			<h2 class="text-xl font-bold mb-4">6. Internal Server Error (500)</h2>
			<p class="text-sm text-gray-600 mb-4">
				Simulate a server error. Check console for <strong>error-level</strong> log (not warning).
			</p>

			<form method="post" action="?/internalError" use:enhance>
				<button type="submit" class="px-4 py-2 bg-red-700 text-white hover:bg-red-800 text-sm">
					Trigger Internal Error
				</button>
			</form>

			{#if form?.action === 'internalError' && form?.error}
				<p class="text-red-600 text-sm mt-4">✗ {form.error}</p>
			{/if}
		</section>

		<!-- Console Output Examples -->
		<section class="border border-gray-300 p-6 bg-gray-50">
			<h2 class="text-xl font-bold mb-4">Expected Console Output</h2>
			<p class="text-sm text-gray-600 mb-4">
				When you trigger errors above, you'll see structured logs in the console like:
			</p>

			<div class="space-y-4">
				<div class="bg-white p-3 border border-gray-300 text-xs font-mono">
					<div class="text-yellow-700">[Validation Error]</div>
					<div class="text-gray-600">
						{JSON.stringify(
							{
								requestId: 'req_abc123',
								errorCount: 2,
								fields: ['email', 'age']
							},
							null,
							2
						)}
					</div>
				</div>

				<div class="bg-white p-3 border border-gray-300 text-xs font-mono">
					<div class="text-yellow-700">[API Error] Unauthorized</div>
					<div class="text-gray-600">
						{JSON.stringify(
							{
								requestId: 'req_abc123',
								type: 'authentication_error',
								status: 401,
								detail: 'Authentication required',
								errorFields: undefined
							},
							null,
							2
						)}
					</div>
				</div>

				<div class="bg-white p-3 border border-gray-300 text-xs font-mono">
					<div class="text-red-700">[API Error] Internal Server Error</div>
					<div class="text-gray-600">
						{JSON.stringify(
							{
								requestId: 'req_abc123',
								type: 'internal_error',
								status: 500,
								detail: 'An unexpected error occurred',
								errorFields: undefined
							},
							null,
							2
						)}
					</div>
				</div>
			</div>

			<p class="text-sm text-gray-600 mt-4">
				<strong>Note:</strong> 4xx errors (client errors) are logged with
				<code class="bg-gray-200 px-1">console.warn()</code>, while 5xx errors (server errors) are
				logged with <code class="bg-gray-200 px-1">console.error()</code>.
			</p>
		</section>

		<!-- Implementation Notes -->
		<section class="border border-gray-300 p-6">
			<h2 class="text-xl font-bold mb-4">Implementation Notes</h2>
			<ul class="list-disc list-inside space-y-2 text-sm text-gray-700">
				<li>
					All error responses use the <code class="bg-gray-100 px-1">ApiError</code> helper from
					<code class="bg-gray-100 px-1">$lib/server/errors.ts</code>
				</li>
				<li>
					Validation uses Zod schemas with automatic field-level error extraction via
					<code class="bg-gray-100 px-1">ApiError.fromZod()</code>
				</li>
				<li>
					Console logging is automatic - no manual <code class="bg-gray-100 px-1"
						>console.log()</code
					> calls needed
				</li>
				<li>
					Each error includes a <code class="bg-gray-100 px-1">requestId</code> for request tracing (in
					production)
				</li>
				<li>
					Error responses follow RFC 7807 structure with <code class="bg-gray-100 px-1">type</code>,
					<code class="bg-gray-100 px-1">title</code>,
					<code class="bg-gray-100 px-1">detail</code>, and
					<code class="bg-gray-100 px-1">status</code>
				</li>
			</ul>
		</section>
	</div>
</div>

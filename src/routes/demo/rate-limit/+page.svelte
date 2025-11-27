<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';
	import Navigation from '$lib/components/ui/layout/Navigation.svelte';

	let { form }: { form: ActionData } = $props();
</script>

<div class="max-w-4xl mx-auto px-4 py-8">
	<Navigation />
	<h1 class="text-3xl font-bold mb-6">Rate Limiting Demo</h1>

	<div class="space-y-8">
		<!-- Introduction -->
		<section class="border border-gray-300 p-6">
			<h2 class="text-xl font-bold mb-4">About Rate Limiting</h2>
			<p class="text-sm text-gray-700 mb-4">
				This demonstrates the in-memory rate limiting system that prevents abuse of authentication
				endpoints and APIs. The system uses a Map-based store with automatic cleanup.
			</p>
			<p class="text-sm text-gray-600 mb-2">
				<strong>How it works:</strong>
			</p>
			<ul class="text-sm text-gray-600 space-y-1 list-disc list-inside">
				<li>Tracks attempts per identifier (IP address, user ID, etc.)</li>
				<li>Enforces maximum attempts within a time window</li>
				<li>Returns time until reset when limit is exceeded</li>
				<li>Automatically cleans up expired entries every 5 minutes</li>
				<li>Suitable for single-instance deployments (use Redis for multi-instance)</li>
			</ul>
		</section>

		<!-- Login Simulation Demo -->
		<section class="border border-gray-300 p-6">
			<h2 class="text-xl font-bold mb-4">Login Rate Limiting</h2>
			<p class="text-sm text-gray-600 mb-4">
				Simulates login attempts with rate limiting. Try clicking multiple times to trigger the
				limit.
			</p>

			<div class="bg-gray-100 p-4 mb-4 text-sm">
				<p><strong>Configuration:</strong></p>
				<p>Max Attempts: 5</p>
				<p>Time Window: 15 minutes</p>
			</div>

			<form method="post" action="?/login" use:enhance class="space-y-4">
				<div>
					<label for="username" class="block text-sm font-medium mb-1">Username</label>
					<input
						id="username"
						name="username"
						type="text"
						class="w-full px-3 py-2 border border-gray-300 text-sm"
						placeholder="Enter username..."
						value="testuser"
					/>
				</div>

				<button
					type="submit"
					class="px-4 py-2 bg-purple-700 text-white hover:bg-purple-800 text-sm"
				>
					Attempt Login
				</button>
			</form>

			{#if form?.action === 'login' && form?.success}
				<div class="bg-green-50 border border-green-300 p-4 mt-4">
					<p class="text-green-800 text-sm">✓ Login attempt allowed</p>
					<p class="text-green-700 text-sm mt-1">
						Remaining attempts: {form.remaining}/{form.maxAttempts}
					</p>
				</div>
			{/if}

			{#if form?.action === 'login' && form?.rateLimited}
				<div class="bg-red-50 border border-red-300 p-4 mt-4">
					<p class="text-red-800 text-sm font-semibold">✗ Rate limit exceeded</p>
					<p class="text-red-700 text-sm mt-1">{form.error}</p>
					{#if form?.resetAt}
						<p class="text-red-600 text-sm mt-1">
							Try again at: {new Date(form.resetAt).toLocaleTimeString()}
						</p>
					{/if}
				</div>
			{/if}

			{#if form?.action === 'login' && form?.attemptCount !== undefined}
				<div class="mt-4 text-sm text-gray-600">
					<p>Total attempts so far: {form.attemptCount}</p>
				</div>
			{/if}
		</section>

		<!-- API Rate Limiting Demo -->
		<section class="border border-gray-300 p-6">
			<h2 class="text-xl font-bold mb-4">API Endpoint Rate Limiting</h2>
			<p class="text-sm text-gray-600 mb-4">
				Simulates API requests with stricter rate limiting. Click rapidly to trigger the limit.
			</p>

			<div class="bg-gray-100 p-4 mb-4 text-sm">
				<p><strong>Configuration:</strong></p>
				<p>Max Attempts: 3</p>
				<p>Time Window: 1 minute</p>
			</div>

			<form method="post" action="?/apiRequest" use:enhance>
				<button
					type="submit"
					class="px-4 py-2 bg-purple-700 text-white hover:bg-purple-800 text-sm"
				>
					Make API Request
				</button>
			</form>

			{#if form?.action === 'apiRequest' && form?.success}
				<div class="bg-green-50 border border-green-300 p-4 mt-4">
					<p class="text-green-800 text-sm">✓ API request allowed</p>
					<p class="text-green-700 text-sm mt-1">
						Remaining requests: {form.remaining}/{form.maxAttempts}
					</p>
				</div>
			{/if}

			{#if form?.action === 'apiRequest' && form?.rateLimited}
				<div class="bg-red-50 border border-red-300 p-4 mt-4">
					<p class="text-red-800 text-sm font-semibold">✗ Rate limit exceeded</p>
					<p class="text-red-700 text-sm mt-1">{form.error}</p>
					{#if form?.resetAt}
						<p class="text-red-600 text-sm mt-1">
							Cooldown ends at: {new Date(form.resetAt).toLocaleTimeString()}
						</p>
					{/if}
				</div>
			{/if}
		</section>

		<!-- Reset Demo -->
		<section class="border border-gray-300 p-6">
			<h2 class="text-xl font-bold mb-4">Reset Rate Limit</h2>
			<p class="text-sm text-gray-600 mb-4">
				Clears the rate limit for the login simulation. Use this to test again after being blocked.
			</p>

			<form method="post" action="?/reset" use:enhance>
				<button
					type="submit"
					class="px-4 py-2 border border-gray-400 bg-white hover:bg-gray-100 text-gray-900 text-sm"
				>
					Reset Login Rate Limit
				</button>
			</form>

			{#if form?.action === 'reset' && form?.success}
				<p class="text-green-600 text-sm mt-4">✓ Rate limit reset successfully</p>
			{/if}
		</section>

		<!-- Implementation Notes -->
		<section class="border border-gray-300 p-6">
			<h2 class="text-xl font-bold mb-4">Implementation Notes</h2>

			<div class="space-y-4 text-sm text-gray-700">
				<div>
					<p class="font-semibold mb-1">Location:</p>
					<code class="bg-gray-100 px-2 py-1">src/lib/server/rate-limit.ts</code>
				</div>

				<div>
					<p class="font-semibold mb-1">Key Functions:</p>
					<ul class="list-disc list-inside space-y-1 ml-4">
						<li>
							<code class="bg-gray-100 px-1">checkRateLimit(identifier, config)</code> - Main function
							to check/update attempts
						</li>
						<li>
							<code class="bg-gray-100 px-1">resetRateLimit(identifier)</code> - Clear rate limit for
							an identifier
						</li>
					</ul>
				</div>

				<div>
					<p class="font-semibold mb-1">Storage:</p>
					<p>
						In-memory Map with automatic cleanup (5-minute intervals). For production multi-instance
						deployments, consider migrating to Redis or Upstash.
					</p>
				</div>

				<div>
					<p class="font-semibold mb-1">Common Use Cases:</p>
					<ul class="list-disc list-inside space-y-1 ml-4">
						<li>Login/registration endpoints (prevent brute force)</li>
						<li>Password reset requests (prevent abuse)</li>
						<li>API endpoints (prevent spam/DOS)</li>
						<li>Comment/post creation (prevent flooding)</li>
					</ul>
				</div>
			</div>
		</section>

		<!-- Back Link -->
		<div class="text-center">
			<a href="/demo" class="text-blue-600 hover:underline text-sm"> ← Back to Demos </a>
		</div>
	</div>
</div>

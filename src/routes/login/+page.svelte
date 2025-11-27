<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import type { PageProps } from './$types';

	let { form }: PageProps = $props();

	// Extract field errors for better UX using $derived
	const emailErrors = $derived((form?.errors as Record<string, string[]>)?.email?.join(', '));
	const passwordErrors = $derived((form?.errors as Record<string, string[]>)?.password?.join(', '));
</script>

<svelte:head>
	<title>Login - Craigslist Clone</title>
</svelte:head>

<div class="max-w-md mx-auto">
	<h1 class="text-2xl font-bold mb-6">Sign in to your account</h1>

	{#if form?.message}
		<div class="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 text-sm">
			{form.message}
		</div>
	{/if}

	<form
		method="post"
		use:enhance={() => {
			return async ({ result, update }) => {
				if (result.type === 'success') {
					// Client-side redirect on success with data invalidation
					await goto('/dashboard', { invalidateAll: true });
				} else {
					// Update form state on failure
					await update();
				}
			};
		}}
		class="space-y-4"
	>
		<div>
			<label for="email" class="block text-sm font-medium mb-1">email address</label>
			<input
				id="email"
				name="email"
				type="email"
				autocomplete="email"
				required
				value={form?.email ?? ''}
				class="w-full px-3 py-1 border text-sm {emailErrors ? 'border-red-500' : 'border-gray-300'}"
				placeholder="you@example.com"
			/>
			{#if emailErrors}
				<p class="mt-1 text-sm text-red-600">{emailErrors}</p>
			{/if}
		</div>

		<div>
			<label for="password" class="block text-sm font-medium mb-1">password</label>
			<input
				id="password"
				name="password"
				type="password"
				autocomplete="current-password"
				required
				class="w-full px-3 py-1 border text-sm {passwordErrors
					? 'border-red-500'
					: 'border-gray-300'}"
				placeholder="••••••••"
			/>
			{#if passwordErrors}
				<p class="mt-1 text-sm text-red-600">{passwordErrors}</p>
			{/if}
		</div>

		<button
			type="submit"
			class="w-full px-4 py-2 bg-purple-700 text-white rounded text-sm hover:bg-purple-800"
		>
			sign in
		</button>
	</form>

	<p class="mt-4 text-sm text-gray-600">
		Don't have an account?
		<a href="/register" class="text-blue-600 hover:underline">Create one</a>
	</p>
</div>

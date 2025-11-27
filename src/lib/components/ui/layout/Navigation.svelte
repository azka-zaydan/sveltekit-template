<script lang="ts">
	import { page } from '$app/state';
	import { goto, invalidateAll } from '$app/navigation';
	import { createApiClient } from '$lib/api/client';

	let user = $derived(page.data.user);
	let isLoggingOut = $state(false);
	let logoutError = $state<string | null>(null);

	async function handleLogout() {
		isLoggingOut = true;
		logoutError = null;

		try {
			const api = createApiClient(fetch);
			await api.auth.logout();

			// Invalidate all data to clear user session from cache
			await invalidateAll();
			// Navigate to home
			goto('/');
		} catch (error) {
			logoutError = error instanceof Error ? error.message : 'Failed to log out. Please try again.';
			console.error('Logout error:', error);
		} finally {
			isLoggingOut = false;
		}
	}
</script>

<header class="mb-6 pb-4 border-b border-gray-300">
	<div class="flex items-center justify-between">
		<a href="/" class="text-3xl font-bold text-purple-700">SvelteKit Template</a>
		<div class="text-sm">
			{#if user}
				<span class="text-gray-700">Hi, {user.username}</span>
				<span class="mx-2">|</span>
				<a href="/dashboard" class="text-blue-600 hover:underline">my account</a>
				<span class="mx-2">|</span>
				<button
					onclick={handleLogout}
					disabled={isLoggingOut}
					class="text-blue-600 hover:underline cursor-pointer"
				>
					{isLoggingOut ? 'logging out...' : 'log out'}
				</button>
				{#if logoutError}
					<span class="text-red-600 ml-2">{logoutError}</span>
				{/if}
			{:else}
				<a href="/login" class="text-blue-600 hover:underline">log in</a>
				<span class="mx-2">|</span>
				<a href="/register" class="text-blue-600 hover:underline">sign up</a>
			{/if}
			<span class="mx-2">|</span>
			<a href="/items/new" class="text-blue-600 hover:underline font-semibold">create item</a>
		</div>
	</div>
</header>

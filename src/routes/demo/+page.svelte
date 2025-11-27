<script lang="ts">
	import { resolve } from '$app/paths';
	import Navigation from '$lib/components/ui/layout/Navigation.svelte';
	import PageHeader from '$lib/components/ui/layout/PageHeader.svelte';
	import Card from '$lib/components/ui/common/display/Card.svelte';

	const breadcrumbs = [{ href: '/', label: 'home' }, { label: 'demo' }];
</script>

<div class="min-h-screen bg-white">
	<div class="max-w-6xl mx-auto px-4 py-6">
		<Navigation />
		<PageHeader title="demo pages" {breadcrumbs} />

		<main class="space-y-4">
			<Card>
				<h2 class="text-xl font-bold mb-2">
					<a href={resolve('/components-demo')} class="text-blue-600 hover:underline"
						>components demo</a
					>
				</h2>
				<p class="text-sm text-gray-600">Showcase of Buttons, Inputs, Cards, Badges.</p>
			</Card>

			<Card>
				<h2 class="text-xl font-bold mb-2">
					<a href={resolve('/demo/lucia')} class="text-blue-600 hover:underline">lucia auth demo</a>
				</h2>
				<p class="text-sm text-gray-600">Authentication with login, register, and sessions.</p>
			</Card>

			<Card>
				<h2 class="text-xl font-bold mb-2">
					<a href={resolve('/demo/logger')} class="text-blue-600 hover:underline"
						>error handling & logging</a
					>
				</h2>
				<p class="text-sm text-gray-600">Validation patterns with structured logging.</p>
			</Card>

			<Card>
				<h2 class="text-xl font-bold mb-2">
					<a href={resolve('/demo/logger/api')} class="text-blue-600 hover:underline"
						>api error logging</a
					>
				</h2>
				<p class="text-sm text-gray-600">Test ApiError/ApiSuccess responses.</p>
			</Card>

			<Card>
				<h2 class="text-xl font-bold mb-2">
					<a href={resolve('/demo/rate-limit')} class="text-blue-600 hover:underline"
						>rate limiting</a
					>
				</h2>
				<p class="text-sm text-gray-600">Protect endpoints with simple limits.</p>
			</Card>
		</main>
	</div>
</div>

<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageServerData } from './$types';
	import Navigation from '$lib/components/ui/layout/Navigation.svelte';
	import PageHeader from '$lib/components/ui/layout/PageHeader.svelte';
	import Card from '$lib/components/ui/common/display/Card.svelte';
	import Button from '$lib/components/ui/common/actions/Button.svelte';

	let { data }: { data: PageServerData } = $props();
	const breadcrumbs = [
		{ href: '/', label: 'home' },
		{ href: '/demo', label: 'demo' },
		{ label: 'lucia auth' }
	];
</script>

<div class="min-h-screen bg-white">
	<div class="max-w-6xl mx-auto px-4 py-6">
		<Navigation />
		<PageHeader title="lucia auth demo" {breadcrumbs} />

		<Card>
			<div class="space-y-2">
				<h2 class="text-xl font-bold text-gray-900">welcome</h2>
				<p class="text-sm text-gray-700">Hi, {data.user.username}!</p>
				<p class="text-sm text-gray-700">Your user ID is {data.user.id}.</p>
			</div>
		</Card>

		<div class="mt-4">
			<form method="post" action="?/logout" use:enhance>
				<Button type="submit" variant="primary">sign out</Button>
			</form>
		</div>
	</div>
</div>

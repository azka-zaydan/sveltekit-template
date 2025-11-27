<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';
	import Navigation from '$lib/components/ui/layout/Navigation.svelte';
	import PageHeader from '$lib/components/ui/layout/PageHeader.svelte';
	import Card from '$lib/components/ui/common/display/Card.svelte';
	import Input from '$lib/components/ui/common/forms/Input.svelte';
	import Button from '$lib/components/ui/common/actions/Button.svelte';

	let { form }: { form: ActionData } = $props();
	const breadcrumbs = [
		{ href: '/', label: 'home' },
		{ href: '/demo', label: 'demo' },
		{ label: 'lucia auth' },
		{ label: 'login' }
	];
</script>

<div class="min-h-screen bg-white">
	<div class="max-w-6xl mx-auto px-4 py-6">
		<Navigation />
		<PageHeader title="login / register" {breadcrumbs} />

		<Card>
			<form method="post" action="?/login" use:enhance class="space-y-4">
				<Input label="username" name="username" type="text" placeholder="enter username..." />
				<Input label="password" name="password" type="password" placeholder="••••••••" />
				<div class="flex gap-2">
					<Button type="submit" variant="primary">login</Button>
					<Button type="submit" variant="secondary" formaction="?/register">register</Button>
				</div>
			</form>
			{#if form?.message}
				<p class="text-sm text-red-600 mt-2">{form.message}</p>
			{/if}
		</Card>
	</div>
</div>

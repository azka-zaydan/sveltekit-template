<script lang="ts">
	import Button from '$lib/components/ui/common/actions/Button.svelte';
	import Input from '$lib/components/ui/common/forms/Input.svelte';
	import Card from '$lib/components/ui/common/display/Card.svelte';
	import Badge from '$lib/components/ui/common/display/Badge.svelte';
	import Navigation from '$lib/components/ui/layout/Navigation.svelte';
	import PageHeader from '$lib/components/ui/layout/PageHeader.svelte';

	let name = $state('');
	let email = $state('');
	const breadcrumbs = [{ href: '/', label: 'home' }, { label: 'components demo' }];
</script>

<div class="min-h-screen bg-white">
	<div class="max-w-6xl mx-auto px-4 py-6">
		<Navigation />
		<PageHeader title="components demo" {breadcrumbs} />

		<main class="space-y-6">
			<section>
				<h1 class="text-2xl font-bold mb-4 text-gray-900">components demo</h1>
				<p class="text-sm text-gray-700 mb-2">
					Showcase of generic components following the retro style.
				</p>
			</section>

			<section class="border border-gray-300 bg-white p-4">
				<h2 class="text-xl font-bold mb-3 text-gray-900">buttons</h2>
				<div class="flex gap-2">
					<Button variant="primary">primary</Button>
					<Button variant="secondary">secondary</Button>
					<Button variant="danger">danger</Button>
					<Button variant="link">link</Button>
				</div>
			</section>

			<section class="border border-gray-300 bg-white p-4">
				<h2 class="text-xl font-bold mb-3 text-gray-900">inputs</h2>
				<div class="space-y-4">
					<Input label="name" type="text" bind:value={name} placeholder="enter your name..." />
					<Input
						label="email address"
						type="email"
						bind:value={email}
						placeholder="you@example.com"
					/>
				</div>
			</section>

			<section class="border border-gray-300 bg-white p-4">
				<h2 class="text-xl font-bold mb-3 text-gray-900">cards</h2>
				<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
					<Card>
						<span class="text-blue-600">simple card</span>
						<div class="text-sm text-gray-700 mt-1">bordered container with minimal padding</div>
					</Card>
					<Card border={false}>
						<span class="text-blue-600">borderless card</span>
						<div class="text-sm text-gray-700 mt-1">no border, plain content area</div>
					</Card>
					<Card padding="lg">
						<span class="text-blue-600">large padding</span>
						<div class="text-sm text-gray-700 mt-1">extra space for content</div>
					</Card>
				</div>
			</section>

			<section class="border border-gray-300 bg-white p-4">
				<h2 class="text-xl font-bold mb-3 text-gray-900">badges</h2>
				<div class="flex gap-2">
					<Badge>default</Badge>
					<Badge variant="success">success</Badge>
					<Badge variant="warning">warning</Badge>
					<Badge variant="danger">danger</Badge>
					<Badge variant="info">info</Badge>
				</div>
			</section>
		</main>
	</div>
</div>

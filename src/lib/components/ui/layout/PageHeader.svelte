<script lang="ts">
	import type { Snippet } from 'svelte';

	interface PageHeaderProps {
		title: string;
		breadcrumbs?: Array<{ href?: string; label: string }>;
		children?: Snippet;
	}

	let { title, breadcrumbs, children }: PageHeaderProps = $props();
</script>

<header class="mb-6">
	{#if breadcrumbs && breadcrumbs.length > 0}
		<nav class="text-sm text-gray-600 mb-2">
			{#each breadcrumbs as crumb, i (i)}
				{#if i > 0}
					<span class="mx-2">›</span>
				{/if}
				{#if i === breadcrumbs.length - 1}
					<span class="text-gray-900">{crumb.label}</span>
				{:else}
					<a href={crumb.href} class="text-blue-600 hover:underline">{crumb.label}</a>
				{/if}
			{/each}
		</nav>
	{/if}
	<div class="flex justify-between items-start">
		<h1 class="text-2xl font-bold text-gray-900">{title}</h1>
		{#if children}
			<div>
				{@render children()}
			</div>
		{/if}
	</div>
</header>

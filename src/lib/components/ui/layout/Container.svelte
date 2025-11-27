<script lang="ts">
	import type { Snippet } from 'svelte';

	interface ContainerProps {
		maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
		children?: Snippet;
	}

	let { maxWidth = 'lg', children }: ContainerProps = $props();

	const maxWidthClasses = {
		sm: 'max-w-2xl',
		md: 'max-w-4xl',
		lg: 'max-w-6xl',
		xl: 'max-w-7xl',
		full: 'max-w-full'
	};

	const classes = `mx-auto px-4 py-6 ${maxWidthClasses[maxWidth]}`;
</script>

<div class={classes}>
	{@render children?.()}
</div>

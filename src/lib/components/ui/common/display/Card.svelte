<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface CardProps extends HTMLAttributes<HTMLDivElement> {
		padding?: 'none' | 'sm' | 'md' | 'lg';
		border?: boolean;
		children?: Snippet;
	}

	let {
		padding = 'md',
		border = true,
		class: className = '',
		children,
		...rest
	}: CardProps = $props();

	const baseClasses = 'bg-white';

	const paddingClasses = {
		none: '',
		sm: 'p-3',
		md: 'p-4',
		lg: 'p-6'
	};

	const borderClass = border ? 'border border-gray-300' : '';

	const classes = `${baseClasses} ${paddingClasses[padding]} ${borderClass} ${className}`;
</script>

<div class={classes} {...rest}>
	{@render children?.()}
</div>

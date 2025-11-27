<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
		variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
		children?: Snippet;
	}

	let { variant = 'default', class: className = '', children, ...rest }: BadgeProps = $props();

	const baseClasses = 'inline-block px-2 py-0.5 text-xs border';

	const variantClasses = {
		default: 'border-gray-400 bg-gray-100 text-gray-800',
		success: 'border-green-600 bg-green-50 text-green-800',
		warning: 'border-yellow-600 bg-yellow-50 text-yellow-800',
		danger: 'border-red-600 bg-red-50 text-red-800',
		info: 'border-purple-600 bg-purple-50 text-purple-800'
	};

	const classes = `${baseClasses} ${variantClasses[variant]} ${className}`;
</script>

<span class={classes} {...rest}>
	{@render children?.()}
</span>

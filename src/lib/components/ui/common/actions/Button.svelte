<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	interface ButtonProps extends HTMLButtonAttributes {
		variant?: 'primary' | 'secondary' | 'danger' | 'link';
		size?: 'sm' | 'md' | 'lg';
		children?: Snippet;
	}

	let {
		variant = 'primary',
		size = 'md',
		class: className = '',
		children,
		...rest
	}: ButtonProps = $props();

	const baseClasses = 'disabled:opacity-50 disabled:cursor-not-allowed';

	const variantClasses = {
		primary: 'bg-purple-700 text-white hover:bg-purple-800 rounded',
		secondary: 'border border-gray-400 bg-white hover:bg-gray-100 text-gray-900',
		danger: 'bg-red-700 text-white hover:bg-red-800 rounded',
		link: 'text-blue-600 hover:underline'
	};

	const sizeClasses = {
		sm: 'px-3 py-1 text-sm',
		md: 'px-4 py-2 text-sm',
		lg: 'px-5 py-2 text-base'
	};

	const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;
</script>

<button class={classes} {...rest}>
	{@render children?.()}
</button>

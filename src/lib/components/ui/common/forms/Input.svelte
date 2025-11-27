<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	interface InputProps extends Omit<HTMLInputAttributes, 'value'> {
		label?: string;
		error?: string;
		fullWidth?: boolean;
		value?: string | number;
	}

	let {
		label,
		error,
		fullWidth = true,
		value = $bindable(),
		class: className = '',
		...rest
	}: InputProps = $props();

	const baseClasses = 'border px-3 py-1 text-sm';
	const stateClasses = error ? 'border-red-500' : 'border-gray-300';
	const widthClass = fullWidth ? 'w-full' : '';

	const inputClasses = `${baseClasses} ${stateClasses} ${widthClass} ${className}`;
</script>

{#if label}
	<label class="block mb-4">
		<span class="block text-sm font-medium mb-1">{label}</span>
		<input class={inputClasses} bind:value {...rest} />
		{#if error}
			<span class="block text-sm text-red-600 mt-1">{error}</span>
		{/if}
	</label>
{:else}
	<input class={inputClasses} bind:value {...rest} />
	{#if error}
		<span class="block text-sm text-red-600 mt-1">{error}</span>
	{/if}
{/if}

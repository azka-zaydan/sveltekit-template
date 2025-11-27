<script lang="ts">
	interface SelectProps {
		id?: string;
		name: string;
		label?: string;
		value: string;
		required?: boolean;
		error?: string;
		class?: string;
		options?: Array<{ value: string; label: string }>;
		placeholder?: string;
		children?: import('svelte').Snippet;
	}

	let {
		id,
		name,
		label,
		value = $bindable(),
		required = false,
		error,
		class: className = '',
		options = [],
		placeholder = 'select an option...',
		children
	}: SelectProps = $props();

	const selectId = $derived(id || name);
</script>

{#if label}
	<label for={selectId} class="block text-sm font-medium mb-1">
		{label}
		{#if required}
			<span class="text-red-500">*</span>
		{/if}
	</label>
{/if}

<select
	{id}
	{name}
	bind:value
	{required}
	class="w-full px-3 py-1 border text-sm {error ? 'border-red-500' : 'border-gray-300'} {className}"
>
	<option value="">{placeholder}</option>
	{#if children}
		{@render children()}
	{:else}
		{#each options as option (option.value)}
			<option value={option.value}>{option.label}</option>
		{/each}
	{/if}
</select>

{#if error}
	<p class="text-red-600 text-xs mt-1">{error}</p>
{/if}

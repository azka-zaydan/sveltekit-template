<script lang="ts">
	interface TextareaProps {
		id?: string;
		name: string;
		label?: string;
		value: string;
		required?: boolean;
		error?: string;
		class?: string;
		placeholder?: string;
		rows?: number;
		maxlength?: number;
	}

	let {
		id,
		name,
		label,
		value = $bindable(),
		required = false,
		error,
		class: className = '',
		placeholder = '',
		rows = 4,
		maxlength
	}: TextareaProps = $props();

	const textareaId = $derived(id || name);
</script>

{#if label}
	<label for={textareaId} class="block text-sm font-medium mb-1">
		{label}
		{#if required}
			<span class="text-red-500">*</span>
		{/if}
	</label>
{/if}

<textarea
	{id}
	{name}
	bind:value
	{required}
	{rows}
	{maxlength}
	{placeholder}
	class="w-full px-3 py-2 border text-sm {error ? 'border-red-500' : 'border-gray-300'} {className}"
></textarea>

{#if error}
	<p class="text-red-600 text-xs mt-1">{error}</p>
{/if}

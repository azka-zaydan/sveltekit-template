<script lang="ts">
	interface FormErrorProps {
		error?: string;
	}

	let { error }: FormErrorProps = $props();
</script>

{#if error}
	<p class="text-red-600 text-xs mt-1">{error}</p>
{/if}

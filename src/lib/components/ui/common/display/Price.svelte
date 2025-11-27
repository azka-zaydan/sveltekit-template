<script lang="ts">
	import { formatPrice } from '$lib/utils';

	let {
		price,
		negotiable = false
	}: { price: string | number | null | undefined; negotiable?: boolean } = $props();
</script>

<span class="font-semibold">
	{formatPrice(price)}
	{#if negotiable && price && parseFloat(price.toString()) > 0}
		<span class="font-normal text-gray-600 text-xs ml-1">(negotiable)</span>
	{/if}
</span>

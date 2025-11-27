<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import type { PageProps } from './$types';
	import { Container, PageHeader } from '$lib/components';
	import Price from '$ui/common/display/Price.svelte';
	import { formatRelativeDate } from '$lib/utils';

	let { data }: PageProps = $props();

	let activeTab = $state<'listings' | 'favorites'>('listings');
</script>

<div class="min-h-screen bg-white">
	<Container>
		<PageHeader title="My Dashboard" />
		<!-- Tabs -->
		<div class="mb-6 border-b border-gray-300">
			<button
				onclick={() => (activeTab = 'listings')}
				class="px-4 py-2 text-sm {activeTab === 'listings'
					? 'text-purple-700 border-b-2 border-purple-700'
					: 'text-blue-600 hover:underline'}"
			>
				my listings ({data.userListings.length})
			</button>
			<button
				onclick={() => (activeTab = 'favorites')}
				class="ml-4 px-4 py-2 text-sm {activeTab === 'favorites'
					? 'text-purple-700 border-b-2 border-purple-700'
					: 'text-blue-600 hover:underline'}"
			>
				saved listings ({data.favorites.length})
			</button>
		</div>

		<!-- My Listings Tab -->
		{#if activeTab === 'listings'}
			<div class="mb-4">
				<a
					href="/listings/new"
					class="inline-block px-4 py-2 bg-purple-700 text-white rounded text-sm hover:bg-purple-800"
				>
					+ create new listing
				</a>
			</div>

			{#if data.userListings.length === 0}
				<div class="border border-gray-300 p-8 text-center">
					<p class="text-gray-600 mb-4">you haven't created any listings yet</p>
					<a
						href="/listings/new"
						class="inline-block px-4 py-2 bg-purple-700 text-white rounded text-sm hover:bg-purple-800"
					>
						create your first listing
					</a>
				</div>
			{:else}
				<div class="space-y-2">
					{#each data.userListings as listing (listing.id)}
						<div class="py-3 border-b border-gray-200">
							<div class="flex justify-between items-start">
								<div class="flex-1">
									<a href="/listings/{listing.id}" class="text-blue-600 hover:underline">
										{listing.title}
									</a>
									<div class="mt-1 text-sm text-gray-600">
										<Price price={listing.price} />
										<span class="mx-2">·</span>
										<span>{listing.category?.name || 'uncategorized'}</span>
										<span class="mx-2">·</span>
										<span>{listing.viewCount} views</span>
										<span class="mx-2">·</span>
										<span>{formatRelativeDate(listing.createdAt)}</span>
									</div>
								</div>
								<div class="flex gap-2 text-sm">
									<a href="/listings/{listing.id}/edit" class="text-blue-600 hover:underline">
										edit
									</a>
									<span class="text-gray-400">|</span>
									<form method="POST" action="/listings/{listing.id}?/delete" class="inline">
										<button
											type="submit"
											class="text-red-600 hover:underline"
											onclick={(e) => {
												if (!confirm('are you sure you want to delete this listing?'))
													e.preventDefault();
											}}
										>
											delete
										</button>
									</form>
								</div>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		{/if}

		<!-- Favorites Tab -->
		{#if activeTab === 'favorites'}
			{#if data.favorites.length === 0}
				<div class="border border-gray-300 p-8 text-center">
					<p class="text-gray-600 mb-4">you haven't saved any listings yet</p>
					<a href="/" class="text-blue-600 hover:underline">browse listings</a>
				</div>
			{:else}
				<div class="space-y-2">
					{#each data.favorites as favorite (favorite.favoriteId)}
						<div class="py-3 border-b border-gray-200">
							<div class="flex justify-between items-start">
								<div class="flex-1">
									<a href="/listings/{favorite.listingId}" class="text-blue-600 hover:underline">
										{favorite.listingTitle}
									</a>
									<div class="mt-1 text-sm text-gray-600">
										<Price price={favorite.listingPrice} />
										<span class="mx-2">·</span>
										<span>{favorite.categoryName}</span>
										<span class="mx-2">·</span>
										<span>{favorite.locationCity}, {favorite.locationState}</span>
									</div>
								</div>
								<form
									method="POST"
									action="?/removeFavorite"
									use:enhance={() => {
										return async ({ update }) => {
											await update();
											await invalidateAll();
										};
									}}
								>
									<input type="hidden" name="listingId" value={favorite.listingId} />
									<button type="submit" class="text-sm text-red-600 hover:underline">
										remove
									</button>
								</form>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		{/if}
	</Container>
</div>

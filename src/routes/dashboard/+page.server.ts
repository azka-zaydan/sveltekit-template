import { createApiClient } from '$api/client';
import { error, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, locals }) => {
	const api = createApiClient(fetch);

	// Require authentication
	if (!locals.user) {
		redirect(303, '/login');
	}

	// Fetch user's listings and favorites concurrently
	const [listingsData, favorites] = await Promise.all([
		api.listings.getAll({ userId: locals.user.id }),
		api.favorites.getAll()
	]);

	return {
		userListings: listingsData.listings,
		favorites
	};
};

export const actions: Actions = {
	removeFavorite: async ({ request, locals, fetch }) => {
		const api = createApiClient(fetch);

		if (!locals.user) {
			redirect(303, '/login');
		}

		const formData = await request.formData();
		const listingId = formData.get('listingId');

		if (!listingId || typeof listingId !== 'string') {
			error(400, 'Listing ID is required');
		}

		try {
			await api.favorites.remove(listingId);
		} catch {
			error(500, 'Failed to remove favorite');
		}

		return { success: true };
	}
};

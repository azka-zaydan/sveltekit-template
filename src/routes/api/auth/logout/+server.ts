import * as auth from '$lib/server/auth';
import { ApiError, ApiSuccess } from '$lib/server/errors';
import { withApiLogging } from '$lib/server/logger/middleware';
import { type RequestEvent } from '@sveltejs/kit';

export async function POST(event: RequestEvent) {
	return withApiLogging(
		event,
		async ({ requestId }) => {
			const { locals, cookies } = event;

			if (!locals.session) {
				return ApiError.unauthorized('Not authenticated', requestId);
			}

			// Invalidate session
			await auth.invalidateSession(locals.session.id);

			// Delete session cookie
			cookies.delete(auth.sessionCookieName, {
				path: '/'
			});

			// Return 204 No Content for logout (standard practice)
			return ApiSuccess.noContent();
		},
		{
			operation: 'LOGOUT_USER',
			schema: 'auth'
		}
	);
}

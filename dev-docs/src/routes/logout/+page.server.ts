import { redirect } from '@sveltejs/kit';
import { SESSION_COOKIE, deleteSessionCookie } from '#lib/server/auth/cookie.js';
import { invalidateSession } from '#lib/server/auth/session.js';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
	redirect(303, '/');
};

export const actions: Actions = {
	default: async ({ cookies }) => {
		const token = cookies.get(SESSION_COOKIE);
		if (token) {
			await invalidateSession(token);
			deleteSessionCookie(cookies);
		}
		redirect(303, '/');
	}
};

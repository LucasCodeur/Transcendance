import type { Handle } from '@sveltejs/kit/hooks';
import { SESSION_COOKIE, deleteSessionCookie, setSessionCookie } from '#lib/server/auth/cookie.js';
import { validateSession } from '#lib/server/auth/session.js';

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.user = null;
	event.locals.session = null;

	const token = event.cookies.get(SESSION_COOKIE);
	if (!token) return resolve(event);

	const result = await validateSession(token);
	if (!result) {
		deleteSessionCookie(event.cookies);
		return resolve(event);
	}

	if (result.renewed) setSessionCookie(event.cookies, token, result.session.expiresAt);

	event.locals.session = {
		id: result.session.id,
		userId: result.session.userId,
		expiresAt: result.session.expiresAt,
		totpPending: result.session.totpPending
	};

	if (event.locals.session.totpPending) return resolve(event); // do not fill user if totpPending

	event.locals.user = {
		id: result.user.id,
		email: result.user.email,
		displayName: result.user.displayName,
		avatarId: result.user.avatarId,
		emailVerified: result.user.emailVerified
	};

	return resolve(event);
}

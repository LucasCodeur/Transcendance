import type { Handle } from '@sveltejs/kit/hooks';
import { SESSION_COOKIE, deleteSessionCookie, setSessionCookie } from '#lib/server/auth/cookie.js';
import { validateSession } from '#lib/server/auth/session.js';

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.user = null;
	event.locals.session = null;

	const token = event.cookies.get(SESSION_COOKIE);
	if (!token) return resolve(event);

	const result = await validateSession(token);
	if (!result) return resolve(event);

	event.locals.user.id = result.user.id;
	event.locals.user.email = result.user.email;
	event.locals.user.displayName = result.user.displayName;
	event.locals.user.emailVerified = result.user.emailVerified;
	
	event.locals.session.id = result.session.id;
	event.locals.session.userId = result.session.userId;
	event.locals.session.expiresAt = result.session.expiresAt;
	event.locals.session.totpPending = result.session.totpPending;
	
	return resolve(event);
}

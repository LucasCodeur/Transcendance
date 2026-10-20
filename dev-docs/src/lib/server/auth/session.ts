import { createHash, randomBytes } from 'node:crypto';
import {
			deleteSession,
			deleteUserSessions,
			findSessionWithUser,
			insertSession,
			updateSessionExpiry,
			type Session
} from '#lib/server/db/sessions.js';
import type { User } from '#lib/server/db/users.js';

const DAY_MS = 1000 * 60 * 60 * 24;
const SESSION_TTL_MS = 30 * DAY_MS;
const RENEW_WHEN_LEFT_MS = 15 * DAY_MS;

export function generateSessionToken(): string {
	return randomBytes(32).toString('base64url');
}

export function hashSessionToken(token: string): string {
	return createHash('sha256').update(token).digest('hex');
}

export async function createSession(userId: string, totpPending = false): Promise<{token: string; session: Session }> {
	const token: string = generateSessionToken();
	const session: Session = await insertSession({
		id: hashSessionToken(token),
		userId,
		expiresAt: new Date(Date.now() + SESSION_TTL_MS),
		totpPending
	});

	return { token, session };
}

export async function validateSession(token: string): Promise<{ session: Session; user: User; renewed: boolean } | null> {
	const found = await findSessionWithUser(hashSessionToken(token));
	let renewed: boolean = false;

	if (!found) return null;

	const { session, user } = found;

	if (session.expiresAt.getTime() <= Date.now()) {
		deleteSession(session.id);
		return null;
	}
	
	if (session.expiresAt.getTime() - Date.now() < RENEW_WHEN_LEFT_MS) {
		updateSessionExpiry(session.id, new Date(Date.now() + SESSION_TTL_MS));
		renewed = true;
	}
	return { session, user, renewed };
}

export async function invalidateSession(token: string): Promise<void> {
	deleteSession(hashSessionToken(token));
}

export async function invalidateUserSession(userId: string): Promise<void> {
	deleteUserSessions(userId);
}

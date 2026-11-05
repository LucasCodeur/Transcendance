import { createHash, randomBytes } from 'node:crypto';
import {
			deleteSession,
			deleteUserSessions,
			findSessionWithUser,
			insertSession,
			updateSessionExpiry,
			completePendingSession,
			type Session
} from '#lib/server/db/sessions.js';
import type { User } from '#lib/server/db/users.js';

const DAY_MS = 1000 * 60 * 60 * 24;
const SESSION_TTL_MS = 30 * DAY_MS;
const RENEW_WHEN_LEFT_MS = 15 * DAY_MS;
const PENDING_TTL_MS = 10 * 60 * 1000;

export function generateSessionToken(): string {
	return randomBytes(32).toString('base64url');
}

export function hashSessionToken(token: string): string {
	return createHash('sha256').update(token).digest('hex');
}

export async function createSession(userId: string, totpPending = false): Promise<{token: string; session: Session }> {
	const token: string = generateSessionToken();
	const expiresAt = new Date(Date.now() + (totpPending ? PENDING_TTL_MS : SESSION_TTL_MS));
	const session: Session = await insertSession({
		id: hashSessionToken(token),
		userId,
		expiresAt,
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
		await deleteSession(session.id);
		return null;
	}
	
	if (!session.totpPending && session.expiresAt.getTime() - Date.now() < RENEW_WHEN_LEFT_MS) {
		const newExpiry = new Date(Date.now() + SESSION_TTL_MS);
		await updateSessionExpiry(session.id, newExpiry);
		renewed = true;
		session.expiresAt = newExpiry;
	}
	return { session, user, renewed };
}

export async function invalidateSession(token: string): Promise<void> {
	await deleteSession(hashSessionToken(token));
}

export async function invalidateUserSession(userId: string): Promise<void> {
	await deleteUserSessions(userId);
}

export async function startSession(user: User): Promise<{ token: string; session: Session }> {
	return createSession(user.id, user.totpSecret !== null);
}

export async function completeTotpSession(sessionId: string): Promise<Date> {
	const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

	await completePendingSession(sessionId, expiresAt);
	return expiresAt;
}

import { db } from './client.js';
import { toUser, type User } from './users.js';

export type Session = {
	id: string, // SHA256 hash of the token
	userId: string,
	expiresAt: Date,
	totpPending: boolean,
	createdAt: Date
};

export type NewSession = Omit<Session, 'createdAt'>;

type SessionRow = Omit<Session, 'createdAt' | 'expiresAt'> & { createdAt: string; expiresAt: string };

function toSession(row: SessionRow): Session {
	return {
		id: row.id,
		userId: row.userId,
		expiresAt: new Date(row.expiresAt),
		totpPending: row.totpPending,
		createdAt: new Date(row.createdAt)
	};
}

export async function insertSession(data: NewSession): Promise<Session> {
	const row = await db.orm.public.Session.create({
		id: data.id,
		userId: data.userId,
		expiresAt: data.expiresAt.toISOString(),
		totpPending: data.totpPending,
	});

	return toSession(row);
}

export async function findSessionWithUser(id: string): Promise<{ session: Session; user: User } | null> {
	const row = await db.orm.public.Session.include('user').first({ id });

	if (!row) return null;

	const { user, ...session } = row;

	return { session: toSession(session), user: toUser(user) };
} 

export async function updateSessionExpiry(id: string, expiresAt: Date): Promise<void> {
	await db.orm.public.Session.where({ id }).update({
		expiresAt: expiresAt.toISOString()
	});
}

export async function deleteSession(id: string): Promise<void> {
	await db.orm.public.Session.where({ id }).delete();
}

export async function deleteUserSessions(userId: string): Promise<void> {
	await db.orm.public.Session.where({ userId }).deleteAll();
}

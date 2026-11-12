import { db } from './client.js';

export type User = {
	id: string;
	email: string;
	displayName: string;
	passwordHash: string | null;
	emailVerified: boolean;
	totpSecret: string | null;
	totpLastStep: number | null;
	createdAt: Date;
	updatedAt: Date;
}

export type NewUser = {
	email: string;
	displayName: string;
	passwordHash: string | null;
}

type UserRow = Omit<User, 'createdAt' | 'updatedAt'> & { createdAt: string; updatedAt: string };

export function toUser(row: UserRow): User {
	return {
		id: row.id,
		email: row.email,
		displayName: row.displayName,
		passwordHash: row.passwordHash,
		emailVerified: row.emailVerified,
		totpSecret: row.totpSecret,
		totpLastStep: row.totpLastStep,
		createdAt: new Date(row.createdAt),
		updatedAt: new Date(row.updatedAt)
	};
}

export async function findUserByEmail(email: string): Promise<User | null> {
	const row: UserRow | null = await db.orm.public.User.first({email});

	return row ? toUser(row) : null;
}

export async function findUserById(id: string): Promise<User | null> {
	const row: UserRow | null = await db.orm.public.User.first({id});

	return row ? toUser(row) : null;
}

export async function createUser(data: NewUser): Promise<User> {
	const row: UserRow = await db.orm.public.User.create({
		email: data.email,
		displayName: data.displayName,
		passwordHash: data.passwordHash
	});
	
	return toUser(row);
}

export function isUniqueViolation(error: unknown): boolean {
	return (
		typeof error === 'object' &&
		error !== null &&
		'sqlState' in error &&
		error.sqlState === '23505'
	);
}

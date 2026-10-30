import { db } from './client.js';
import { toUser, type NewUser, type User } from './users.js';
import type { OAuthProvider } from '#lib/schemas/oauth.js';

export type OAuthAccount = {
	id:				string,
	provider:		OAuthProvider,
	providerUserId:	string,
	createdAt:		Date,
}

export type OAuthAccountRow = Omit<OAuthAccount, 'createdAt' | 'provider'> & { createdAt: string; provider: string };

function toOAuthAccount(row: OAuthAccountRow): OAuthAccount {
	return {
		...row,
		createdAt: new Date(row.createdAt),
		provider: row.provider as OAuthProvider
	};
}

export async function findOAuthAccountWithUser(provider: OAuthProvider, providerUserId: string)
		: Promise<{ account: OAuthAccount; user: User } | null> {
	const rows = await db.orm.public.OAuthAccount.include('user').first({ provider, providerUserId });

	if (!rows) return null;
	const { user, ...account } = rows;
	return { user: toUser(user), account: toOAuthAccount(account) };
}

export async function findUserOAuthAccounts(userId: string): Promise<OAuthAccount[]> {
	const rows = await db.orm.public.OAuthAccount.where({ userId }).all();

	return rows.map(toOAuthAccount);
}

export async function createUserWithOauthAccount(
		data: NewUser & { emailVerified: boolean },
		provider: OAuthProvider,
		providerUserId: string
): Promise<User> {
	return db.transaction(async (tx) => {
		const user = await tx.orm.public.User.create({ email: data.email, displayName: data.displayName, passwordHash: data.passwordHash, emailVerified: data.emailVerified });
		await tx.orm.public.OAuthAccount.create({ provider, providerUserId, userId: user.id });

		return toUser(user);
	});
}

export async function insertOAuthAccount(userId: string, provider: OAuthProvider, providerUserId: string)
		: Promise<OAuthAccount> {
	const row = await db.orm.public.OAuthAccount.create({
		provider,
		providerUserId,
		userId
	});
	
	return toOAuthAccount(row);
}

export async function deleteOAuthAccount(userId: string, provider: OAuthProvider): Promise<void> {
	await db.orm.public.OAuthAccount.where({ userId, provider }).delete();
}

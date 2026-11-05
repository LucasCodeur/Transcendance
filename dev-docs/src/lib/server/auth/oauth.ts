import type { OAuthProvider } from '#lib/schemas/oauth.ts';
import type { OAuthProfile } from '#lib/server/auth/oauth-providers.ts';
import { createUserWithOauthAccount, deleteOAuthAccount, findOAuthAccountWithUser, findUserOAuthAccounts, insertOAuthAccount } from '../db/oauth-accounts';
import { findUserByEmail, findUserById, isUniqueViolation } from '../db/users';
import { createSession } from './session';

export type OAuthLoginResult =
	| { ok: true; token: string; expiresAt: Date }
	| { ok: false; code: 'EMAIL_TAKEN' | 'EMAIL_MISSING' };

export type OAuthLinkResult =
	| { ok: true }
	| { ok: false; code: 'LINKED_TO_ANOTHER_USER' | 'PROVIDER_ALREADY_LINKED' };

export type OAuthUnlinkResult = { ok: true } | { ok: false; code: 'NOT_LINKED' | 'LAST_LOGIN_METHOD' }

export async function loginWithOAuth(provider: OAuthProvider, profile: OAuthProfile): Promise<OAuthLoginResult>{

    const existing = await findOAuthAccountWithUser(provider, profile.providerUserId);

    let userId: string;

    if (existing)
        userId = existing.user.id;
    else
    {
        if (profile.email === null)
            return {ok: false, code: 'EMAIL_MISSING'};

        if (await findUserByEmail(profile.email) !== null)
            return {ok: false, code: 'EMAIL_TAKEN'};

        try {
            const user = await createUserWithOauthAccount(
                {email: profile.email, displayName: profile.displayName, passwordHash: null, emailVerified: true },
                provider,
                profile.providerUserId
            );
            userId = user.id;
        } catch (error) {
            if (isUniqueViolation(error)) return {ok: false, code: 'EMAIL_TAKEN'};
            throw error;
        }
    }
    const {token, session} = await createSession(userId);

    return {ok: true, token, expiresAt: session.expiresAt};
}

export async function linkOAuthAccount(userId: string, provider: OAuthProvider, profile: OAuthProfile): Promise<OAuthLinkResult>
{
    const existing = await findOAuthAccountWithUser(provider, profile.providerUserId);

    if (existing)
    {
        if (userId !== existing.user.id)
            return {ok: false, code: 'LINKED_TO_ANOTHER_USER'};
        return {ok: true};
    }

    const userAccounts = await findUserOAuthAccounts(userId);

    if (userAccounts.some(account => account.provider === provider))
        return {ok: false, code: 'PROVIDER_ALREADY_LINKED'};

    try {
        await insertOAuthAccount(userId, provider, profile.providerUserId);
    } 
    catch (error) {
        if (isUniqueViolation(error)) 
            return {ok: false, code: 'LINKED_TO_ANOTHER_USER'};
        throw error;
    }
    return {ok: true};
}

export async function unlinkOAuthAccount(userId: string, provider: OAuthProvider):Promise<OAuthUnlinkResult>
{
    const user = await findUserById(userId);
 
    if (!user)
        throw new Error('User not found');

    const userAccounts = await findUserOAuthAccounts(userId);

    if (!userAccounts.some(account => account.provider === provider))
        return {ok: false, code: 'NOT_LINKED'};
    else if (user.passwordHash === null && userAccounts.length === 1)
        return {ok: false, code: 'LAST_LOGIN_METHOD'};

    await deleteOAuthAccount(userId, provider);
    return {ok: true};
}
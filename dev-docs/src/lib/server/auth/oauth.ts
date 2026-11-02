import type { OAuthProvider } from '#lib/schemas/oauth.ts';
import type { OAuthProfile } from '#lib/server/auth/oauth-providers.ts';
import { create } from 'node:domain';

import { createUserWithOauthAccount, findOAuthAccountWithUser } from '../db/oauth-accounts';
import { findUserByEmail } from '../db/users';
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

        const user = await createUserWithOauthAccount(
            {email: profile.email, displayName: profile.displayName, passwordHash: null, emailVerified: true }, 
            provider, 
            profile.providerUserId
        );
        userId = user.id;
    }
    
    const {token, session} = await createSession(userId);

    return {ok: true, token, expiresAt: session.expiresAt};
}


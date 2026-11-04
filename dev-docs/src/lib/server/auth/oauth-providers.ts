import z from 'zod';
import { FORTYTWO_CLIENT_ID, FORTYTWO_CLIENT_SECRET, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, ORIGIN }
	from '$app/env/private';
import type { OAuthProvider } from '#lib/schemas/oauth.ts';

export type OAuthProfile = {
    providerUserId: string;
    email: string | null;
    displayName: string;
};

type ProviderConfig = {
	authorizationEndpoint: string;
	tokenEndpoint: string;
	scopes: string[];
	clientId: string;
	clientSecret: string;
	getProfile(accessToken: string): Promise<OAuthProfile>;
};

const fortyTwoUserSchema = z.object({
	id: z.number(),
	email: z.string(),
	login: z.string(),
	displayname: z.string().nullish()
});

const gitHubUserSchema = z.object({
    id: z.number(),
    login: z.string(),
    name: z.string().nullish()
});

const gitHubEmailsSchema = z.array(z.object({ email: z.string(), primary: z.boolean(), verified: z.boolean() }));

async function getJson<T extends z.ZodType>(url: string, accessToken: string, schema: T): Promise<z.infer<T>>{
    const response = await fetch(url, {
        headers: {
            Authorization : `Bearer ${accessToken}`,
            Accept: 'application/json', 
             'User-Agent': 'ft_transcendence'
        }
    });
    if (!response.ok)
        throw new Error(`${url} answered ${response.status}`);

    return schema.parse(await response.json());
}

function displayNameForm(...candidates: (string | null | undefined)[]): string {
    const name = candidates.find((c)=> c && c.trim().length >= 2) ?? 'user';
    return name.trim().slice(0, 50);
}

const providers: Record<OAuthProvider, ProviderConfig> = {
	fortytwo: { 
        authorizationEndpoint: 'https://api.intra.42.fr/oauth/authorize',
        tokenEndpoint : 'https://api.intra.42.fr/oauth/token',
        scopes: ['public'],
        clientId : FORTYTWO_CLIENT_ID,
        clientSecret : FORTYTWO_CLIENT_SECRET,
        async getProfile(accessToken) {
            const me = await getJson('https://api.intra.42.fr/v2/me', accessToken, fortyTwoUserSchema);
            return {
                providerUserId: String(me.id),
                email: me.email.trim().toLowerCase(),
                displayName: displayNameForm(me.login, me.displayname)
            };
        }
     },
	github: { 
        authorizationEndpoint: 'https://github.com/login/oauth/authorize',
        tokenEndpoint: 'https://github.com/login/oauth/access_token',
        scopes: ['read:user', 'user:email'],
        clientId : GITHUB_CLIENT_ID,
        clientSecret : GITHUB_CLIENT_SECRET,
        async getProfile(accessToken) {
            const user = await getJson('https://api.github.com/user', accessToken, gitHubUserSchema);
            const emails = await getJson('https://api.github.com/user/emails', accessToken, gitHubEmailsSchema);
            const primary = emails.find((e) => e.primary && e.verified);
            return {
                providerUserId: String(user.id),
                email: primary?.email.trim().toLowerCase() ?? null,
                displayName: displayNameForm(user.name, user.login)
            };
        }
     }
};

export function createAuthorizationURL(provider: OAuthProvider, state: string): URL {
    
    const config = providers[provider];
    const url = new URL(config.authorizationEndpoint);

    url.searchParams.set(`response_type`, `code`);
    url.searchParams.set('client_id', config.clientId);
    url.searchParams.set('redirect_uri', redirectURI(provider));
    url.searchParams.set('scope', config.scopes.join(' '));
    url.searchParams.set('state', state);

    return url;
}

function redirectURI(provider: OAuthProvider): string{
    return new URL (`/oauth/${provider}/callback`, ORIGIN).toString();
}

const tokenResponseSchema = z.object({access_token: z.string()});

async function exchangeCode(provider: OAuthProvider, code: string): Promise<string>{
    const config = providers[provider];
    const response = await fetch(config.tokenEndpoint, {
        method: "POST",
        headers:{
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'application/json'
        },
        body : new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: redirectURI(provider),
            client_id: config.clientId,
            client_secret: config.clientSecret
        })
    });

    const body = await response.json().catch(() => null);
    const parsed = tokenResponseSchema.safeParse(body);

    if (!response.ok || !parsed.success)
        throw new Error(`${provider} token exchange failed (${response.status}): ${JSON.stringify(body)}`);

    return parsed.data.access_token;
}

export async function fetchProfile(provider: OAuthProvider, code: string): Promise<OAuthProfile> {
	const accessToken = await exchangeCode(provider, code);

	return providers[provider].getProfile(accessToken);
}

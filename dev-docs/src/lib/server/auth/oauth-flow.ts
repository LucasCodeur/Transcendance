import { dev } from '$app/env';
import type { Cookies } from '@sveltejs/kit';
import { randomBytes } from 'node:crypto';
import { z } from 'zod';
import { oauthProviderSchema, type OAuthProvider } from '#lib/schemas/oauth.js';
import { createAuthorizationURL } from './oauth-providers.ts';

const OAUTH_COOKIE = 'oauth_flow';
const OAUTH_FLOW_PATH = '/oauth';

const oauthFlowSchema = z.object({
	provider: oauthProviderSchema,
	state: z.string(),
	intent: z.enum(['login', 'link']),
	userId: z.string().nullable(),
	redirectTo: z.string().nullable(),
});

export type OAuthFlow = z.infer<typeof oauthFlowSchema>;

function generateState(): string {
	return randomBytes(32).toString('base64url');
}

export function beginOAuthFlow(cookies: Cookies, flow: Omit<OAuthFlow, 'state'>): URL {
	const state = generateState();
	
	cookies.set(OAUTH_COOKIE, JSON.stringify({ ...flow, state }), {
		path: OAUTH_FLOW_PATH,
		httpOnly: true,
		secure: !dev,
		sameSite: 'lax',
		maxAge: 60 * 10
	});

	return createAuthorizationURL(flow.provider, state);
}

export function takeOAuthFlow(cookies: Cookies, provider: OAuthProvider, state: string | null): OAuthFlow | null {
	const raw = cookies.get(OAUTH_COOKIE);

	cookies.delete(OAUTH_COOKIE, {
		path: OAUTH_FLOW_PATH,
		httpOnly: true,
		secure: !dev,
		sameSite: 'lax'
	});

	if (!raw) return null;

	let flow: OAuthFlow;
	try {
		const parsed = oauthFlowSchema.safeParse(JSON.parse(raw));
		if (!parsed.data) return null;
		flow = parsed.data;
	} catch {
		return null;
	}

	if (flow.provider !== provider || state === null || flow.state !== state)
		return null;
	return flow;
}

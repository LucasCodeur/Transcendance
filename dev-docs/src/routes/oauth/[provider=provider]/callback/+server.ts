import { redirect } from '@sveltejs/kit';
import { takeOAuthFlow } from '#lib/server/auth/oauth-flow.js';
import { fetchProfile, type OAuthProfile } from '#lib/server/auth/oauth-providers.ts';
import { loginWithOAuth, linkOAuthAccount } from '#lib/server/auth/oauth.ts';
import { setSessionCookie } from '#lib/server/auth/cookie.ts';
import { safeRedirect } from '#lib/server/auth/redirect.ts';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({params, url, locals, cookies}) => {

    const flow = takeOAuthFlow(cookies, params.provider, url.searchParams.get('state'));

    if (!flow)
        redirect(303, '/login?error=oauth_invalid');

    const back = flow.intent === 'link' ? '/account' : '/login';
    const code = url.searchParams.get('code');

    if (!code)
        redirect(303, `${back}?error=oauth_cancelled`);

    let profile: OAuthProfile;

    try {
	    profile = await fetchProfile(params.provider, code);
    }
    catch (error) {
	    console.error(`OAuth ${params.provider} failed:`, error);
	    redirect(303, `${back}?error=oauth_failed`);
    }

    if (flow.intent === 'link') {
        if (!locals.user || locals.user.id !== flow.userId)
            redirect(303, '/login?error=oauth_invalid');

        const result = await linkOAuthAccount(locals.user.id, params.provider, profile);

        if(!result.ok)
            redirect(303, `/account?error=${result.code.toLowerCase()}`);
        redirect(303, `/account?linked=${params.provider}`);
    }

    const result = await loginWithOAuth(params.provider, profile);

    if (!result.ok)
        redirect(303, `/login?error=${result.code.toLowerCase()}`);
    
    setSessionCookie(cookies, result.token, result.expiresAt);
	
	if (result.totpRequired) {
		const query = flow.redirectTo ? `?redirectTo=${encodeURIComponent(flow.redirectTo)}` : '';
		redirect(303, `/login/2fa${query}`);
	}

    redirect(303, safeRedirect(flow.redirectTo));
}

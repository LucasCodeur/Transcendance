import { redirect } from '@sveltejs/kit';
import { beginOAuthFlow } from '#lib/server/auth/oauth-flow.js';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ params, url, locals, cookies }) => {
	if (locals?.user) redirect(303, '/account');
	const authorizationURL = beginOAuthFlow(cookies, {
		provider: params.provider,
		intent: 'login',
		userId: null,
		redirectTo: url.searchParams.get('redirectTo')
	});

	redirect(302, authorizationURL, { external: [authorizationURL.origin] });
}

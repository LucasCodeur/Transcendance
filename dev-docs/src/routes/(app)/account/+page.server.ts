import { error, fail, redirect } from '@sveltejs/kit';
import { oauthProviderSchema } from '#lib/schemas/oauth.ts'; 
import { beginOAuthFlow } from '#lib/server/auth/oauth-flow.ts';
import { getLoginMethods, unlinkOAuthAccount } from '#lib/server/auth/oauth.ts';
import type {Actions, PageServerLoad } from './$types';

const ACCOUNT_MESSAGES: Record<string, string> = {
    oauth_invalid: 'Invalid authentication.',
    oauth_failed: 'Authentication has failed.',
    oauth_cancelled: 'Authentication has been cancelled.',
    linked_to_another_user: 'This account is linked to another user.',
    provider_already_linked: 'You already have an account linked with this provider.',

    not_linked: 'This provider is not linked to your account.',
    last_login_method: 'You cannot unlink your only login method. Set a password or link another provider first.'
};

export const load: PageServerLoad = async ({ locals, url }) => {

    if (!locals.user)
        redirect(303, '/login');

    const loginMethods = await getLoginMethods(locals.user.id);
    const codeError = url.searchParams.get('error');
    const message = codeError ? (ACCOUNT_MESSAGES[codeError] ?? null) : null;
    const parsed = oauthProviderSchema.safeParse(url.searchParams.get('linked'));
    const linked = parsed.success ? parsed.data : null ;

    return {loginMethods, message, linked};
}

export const actions: Actions = {
    link : async ({ request, cookies, locals}) => {
        if (!locals.user)
            error(401);

        const formData = await request.formData();
        const parsed = oauthProviderSchema.safeParse(formData.get('provider'));

        if (!parsed.success)
            return fail(400, { message: 'Invalid provider' });

        const authorizationURL = beginOAuthFlow( cookies, {
            provider: parsed.data,
            intent: 'link',
            userId: locals.user.id,
            redirectTo: null
        });
        redirect (303, authorizationURL, { external: [authorizationURL.origin]});
    },
    unlink : async ({ request, locals }) => {
        if (!locals.user)
            error(401);

        const formData = await request.formData();
        const parsed = oauthProviderSchema.safeParse(formData.get('provider'));

        if (!parsed.success)
            return fail(400, { message: 'Invalid provider' });

        const result = await unlinkOAuthAccount(locals.user.id, parsed.data);

        if (!result.ok)
            return fail(400, { message: ACCOUNT_MESSAGES[result.code.toLowerCase()]});
        return { message: 'Provider unlinked' };
    }
};
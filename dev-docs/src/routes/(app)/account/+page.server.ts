import { error, fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import { profileSchema } from '#lib/schemas/account.ts';
import { AVATAR_MAX_BYTES, avatarSchema } from '#lib/schemas/avatar.ts';
import { OAUTH_PROVIDER_LABELS, oauthProviderSchema } from '#lib/schemas/oauth.ts'; 
import { removeAvatar, updateAvatar, updateProfile } from '#lib/server/account/service.ts';
import { beginOAuthFlow } from '#lib/server/auth/oauth-flow.ts';
import { getLoginMethods, unlinkOAuthAccount } from '#lib/server/auth/oauth.ts';
import type {Actions, PageServerLoad } from './$types';

const ACCOUNT_MESSAGES: Record<string, string> = {
	oauth_invalid: 'The link attempt expired or was invalid. Please try again.',
	oauth_failed: 'The provider could not be reached. Please try again.',
	oauth_cancelled: 'Linking cancelled.',
	linked_to_another_user: 'This provider account is already linked to another user.',
	provider_already_linked: 'You already have an account linked with this provider.',
	not_linked: 'This provider is not linked to your account.',
	last_login_method: 'You cannot unlink your only sign-in method. Set a password or link another provider first.'
};

const AVATAR_MESSAGES = {
	INVALID_IMAGE: 'This file is not a valid PNG, JPEG or WebP image.',
	CONFLICT: 'Your profile picture changed in the meantime. Please try again.',
	NO_AVATAR: 'You have no profile picture to remove.',
	TOO_LARGE: 'The image must be 2 MB or smaller.'
} as const;

const MAX_AVATAR_REQUEST_BYTES = AVATAR_MAX_BYTES + 64 * 1024;

export const load: PageServerLoad = async ({ locals, url }) => {

	if (!locals.user) redirect(303, '/login?redirectTo=/account');

	const loginMethods = await getLoginMethods(locals.user.id);
	const code = url.searchParams.get('error');
	const parsed = oauthProviderSchema.safeParse(url.searchParams.get('linked'));

	return {
		loginMethods,
		message: code ? (ACCOUNT_MESSAGES[code] ?? null) : null,
		linked: parsed.data ?? null
	};
}

export const actions: Actions = {
	profile: async ({ request, locals }) => {
		if (!locals.user) error(401);

		const form = Object.fromEntries(await request.formData());
		const displayName = String(form.displayName ?? ''); 
		const parsed = profileSchema.safeParse(form);

		if (!parsed.success) return fail(400, { action: 'profile', displayName, errors: z.flattenError(parsed.error).fieldErrors });
		
		await updateProfile(locals.user.id, parsed.data);
		
		return { action: 'profile', message: 'Profile updated.'};
	},
	avatar: async ({ request, locals }) => {
		if (!locals.user) error(401);

		if (Number(request.headers.get('content-length') ?? 0) > MAX_AVATAR_REQUEST_BYTES) 
			return fail(413, { action: 'avatar', errors: { avatar: [AVATAR_MESSAGES.TOO_LARGE]}});

		const parsed = avatarSchema.safeParse({ avatar: (await request.formData()).get('avatar') });
		if (!parsed.success) return fail(400, { action: 'avatar', errors: z.flattenError(parsed.error).fieldErrors });

		const result = await updateAvatar(locals.user.id, parsed.data);

		if (!result.ok)
			return result.code === 'INVALID_IMAGE' ? fail(400, { action: 'avatar', errors: { avatar: [AVATAR_MESSAGES.INVALID_IMAGE] } })  : fail(409, { action: 'avatar', error: AVATAR_MESSAGES[result.code] });

		return { action: 'avatar', message: 'Profile picture updated.'}
	},
	removeAvatar: async ({ locals }) => {
		if (!locals.user) error(401);

		const result = await removeAvatar(locals.user.id);

		if (!result.ok)
			return fail(result.code === 'CONFLICT' ? 409 : 400, { action: 'avatar', error: AVATAR_MESSAGES[result.code] });
		
		return { action: 'avatar', message: 'Profile picture removed' };
	},
	link : async ({ request, cookies, locals}) => {
		if (!locals.user)
			error(401);

		const parsed = oauthProviderSchema.safeParse((await request.formData()).get('provider'));

		if (!parsed.success)
			return fail(400, { action: 'provider', error: 'Invalid provider.' });

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

		const parsed = oauthProviderSchema.safeParse((await request.formData()).get('provider'));

		if (!parsed.success)
			return fail(400, { action: 'provider', error: 'Invalid provider.' });

		const result = await unlinkOAuthAccount(locals.user.id, parsed.data);

		if (!result.ok)
			return fail(400, { action: 'provider', error: ACCOUNT_MESSAGES[result.code.toLowerCase()]});
		return { action: 'provider', message: `${OAUTH_PROVIDER_LABELS[parsed.data]} unlinked.`};
	}
};

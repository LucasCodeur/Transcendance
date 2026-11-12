import { error, fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import { secondFactorSchema, totpCodeSchema } from '#lib/schemas/two-factor.js';
import { clearFailures, recordFailure, tooManyAttempts } from '#lib/server/auth/rate-limit.js';
import { beginTotpSetup, clearTotpSetup, readTotpSetup } from '#lib/server/auth/totp-setup.js';
import {
	describeTotpSetup,
	disableTwoFactor,
	enableTwoFactor,
	getTwoFactorStatus,
	regenerateRecoveryCodes
} from '#lib/server/auth/two-factor.js';
import type { Actions, PageServerLoad } from './$types';

const MAX_ATTEMPTS = 5;
const TOO_MANY = 'Too many attemps. try again in few minutes.';
const NOTICES: Record<string, string> =  {
	recovery_code_used: 'You logged in with a recovery code. It cannot be used again.',
};

export const load: PageServerLoad = async ({ locals, cookies, url }) => {
	if (!locals.user) redirect(303, '/login?redirectTo=/account/security');
	
	const status = await getTwoFactorStatus(locals.user.id);
	const secret = status.enabled ? null : readTotpSetup(cookies, locals.user.id);
	const notice = url.searchParams.get('notice');

	return {
		status,
		setup: secret ? await describeTotpSetup(secret, locals.user.email) : null,
		notice: notice ? (NOTICES[notice] ?? null) : null
	};
}

export const actions: Actions = {
	setup: async ({ locals, cookies }) => {
		if (!locals.user) error(401);
		beginTotpSetup(cookies, locals.user.id);
	},

	confirm: async ({ request, locals, cookies }) => {
		if (!locals.user) error(401);

		const secret = readTotpSetup(cookies, locals.user.id);
		if (!secret) return fail(400, { action: 'confirm', message: 'The setup expired. Start again.' });
		
		const parsed = totpCodeSchema.safeParse(Object.fromEntries(await request.formData()));
		if (!parsed.success) {
			return fail(400, { action: 'confirm', errors: z.flattenError(parsed.error).fieldErrors });
		}

		const result = await enableTwoFactor(locals.user.id, secret, parsed.data.code);
		if (!result.ok) {
			const message = result.code === 'ALREADY_ENABLED' ? 'Two-factor authentication is already on.' : 'Invalid code.';
			return fail(400, { action: 'confirm', message });
		}

		clearTotpSetup(cookies);
		return { action: 'confirm', recoveryCodes: result.recoveryCodes };
	},

	cancel: async ({ locals, cookies }) => {
		if (!locals.user) error(401);
		clearTotpSetup(cookies);
	},
	
	disable: async ({ request, locals }) => {
		if (!locals.user) error(401);

		const parsed = secondFactorSchema.safeParse(Object.fromEntries(await request.formData()));
		if (!parsed.success) {
			return fail(400, { action: 'disable', errors: z.flattenError(parsed.error).fieldErrors });
		}

		const key = `2fa:${locals.user.id}`;
		if (tooManyAttempts(key, MAX_ATTEMPTS)) return fail(429, { action: 'disable', message: TOO_MANY });

		const result = await disableTwoFactor(locals.user.id, parsed.data.code);
		if (!result.ok) {
			recordFailure(key);
			return fail(400, { action: 'disable', message: 'Invalid code.' });
		}
		clearFailures(key);

		return { action: 'disable', message: 'Two-factor authentication is now off.' };
	},

	regenerate: async ({ request, locals }) => {
		if (!locals.user) error(401);

		const parsed = secondFactorSchema.safeParse(Object.fromEntries(await request.formData()));
		if (!parsed.success) {
			return fail(400, { action: 'regenerate', errors: z.flattenError(parsed.error).fieldErrors });
		}

		const key = `2fa:${locals.user.id}`;
		if (tooManyAttempts(key, MAX_ATTEMPTS)) return fail(429, { action: 'regenerate', message: TOO_MANY });

		const result = await regenerateRecoveryCodes(locals.user.id, parsed.data.code);
		if (!result.ok) {
			recordFailure(key);
			return fail(400, { action: 'regenerate', message: 'Invalid code.' });
		}
		clearFailures(key);

		return { action: 'regenerate', recoveryCodes: result.recoveryCodes };
	}
};

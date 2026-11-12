import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import { secondFactorSchema } from '#lib/schemas/two-factor.js';
import { SESSION_COOKIE, setSessionCookie } from '#lib/server/auth/cookie.js';
import { clearFailures, recordFailure, tooManyAttempts } from '#lib/server/auth/rate-limit.js';
import { safeRedirect } from '#lib/server/auth/redirect.js';
import { completeTotpSession } from '#lib/server/auth/session.js';
import { verifySecondFactor } from '#lib/server/auth/two-factor.js';
import type { Actions, PageServerLoad } from './$types';

const MAX_ATTEMPTS = 5;

export const load: PageServerLoad = ({ locals }) => {
	if (locals.user)
		redirect(303, '/account');
	if (!locals.session?.totpPending)
		redirect(303, '/login');
}

export const actions: Actions = {
	default: async ({ locals, request, cookies, url }) => {
		const session = locals.session;
		const token = cookies.get(SESSION_COOKIE);

		if (!session?.totpPending || !token)
			redirect(303, '/login');

		const parsed = secondFactorSchema.safeParse(Object.fromEntries(await request.formData()));
		if (!parsed.success)
			return fail(400, { errors: z.flattenError(parsed.error).fieldErrors });

		const key = `2fa:${session.userId}`;

		if (tooManyAttempts(key, MAX_ATTEMPTS))
			return fail(429, { message: 'Too much try, retry in few minutes' });

		const result = await verifySecondFactor(session.userId, parsed.data!.code);
		if (!result.ok) {
			recordFailure(key);
			return fail(400, { message: 'Invalid code.' });
		}

		clearFailures(key);

		setSessionCookie(cookies, token, await completeTotpSession(session.id));

		if (result.usedRecoveryCode)
			redirect(303, '/account/security?notice=recovery_code_used');
		redirect(303, safeRedirect(url.searchParams.get('redirectTo')));
	}
}

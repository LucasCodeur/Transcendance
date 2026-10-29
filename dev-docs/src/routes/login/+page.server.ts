import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import { loginSchema } from '#lib/schemas/auth.js'; // WARNING: reason for auth.js and not auth.ts knowing that there is no auth.js but only auth.ts
import { setSessionCookie } from '#lib/server/auth/cookie.js'; // WARNING: same thing here 
import { clearFailures, recordFailure, tooManyAttempts } from '#lib/server/auth/rate-limit.js';
import { safeRedirect } from '#lib/server/auth/redirect.js'; // WARNING: same here
import { loginUser } from '#lib/server/auth/service.js';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
	if (locals.user) redirect(303, '/account');
};

export const actions: Actions = {
	default: async ({ request, cookies, getClientAddress, url }) => {
		const form = Object.fromEntries(await request.formData());

		const email = String(form.email ?? '');

		const parsed = loginSchema.safeParse(form);
		if (!parsed.success)
			return fail(400, { email, errors: z.flattenError(parsed.error).fieldErrors });

		const ipKey = `ip:${getClientAddress()}`;
		const emailKey = `email:${parsed.data.email}`;

		if (tooManyAttempts(ipKey, 20) || tooManyAttempts(emailKey, 5))
			return fail(429, { email, message: 'Too much try, retry in few minutes' });

		const result = await loginUser(parsed.data);

		if (!result.ok) {
			recordFailure(ipKey);
			recordFailure(emailKey);
			return fail (400, { email, message: 'incorrect email or password' });
		}

		clearFailures(ipKey);
		clearFailures(emailKey);

		setSessionCookie(cookies, result.token, result.expiresAt);
		redirect(303, safeRedirect(url.searchParams.get('redirectTo')));
	}
};

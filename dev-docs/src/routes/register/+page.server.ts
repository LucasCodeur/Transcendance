import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import { registerSchema } from '#lib/schemas/auth.js';
import { setSessionCookie } from '#lib/server/auth/cookie.js';
import { registerUser } from '#lib/server/auth/service.js';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
	if (locals.user) redirect(303, '/account');
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const form = Object.fromEntries(await request.formData());
		const values = {
			email: String(form.email ?? ''),
			displayName: String(form.displayName ?? '')
		};
		const parsed = registerSchema.safeParse(form);
		if (!parsed.success) {
			return fail(400, { ...values, errors: z.flattenError(parsed.error).fieldErrors });
		}
		
		const result = await registerUser(parsed.data);
		if (!result.ok) return fail(409, { ...values, errors: { email: ['Email already exist'] } });
		
		setSessionCookie(cookies, result.token, result.expiresAt);
		
		redirect(303, '/account');
	}
};

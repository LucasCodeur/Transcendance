import { dev } from '$app/env';
import type { Cookies } from '@sveltejs/kit';
import { z } from 'zod';
import { decrypt, encrypt } from './encryption.js';
import { generateTotpSecret } from './totp';

const SETUP_COOKIE = 'totp_setup';
const SETUP_PATH = '/account/security';

const setupSchema = z.object({ userId: z.string(), secret: z.string() });

export function beginTotpSetup(cookies: Cookies, userId: string): string {
	const secret = generateTotpSecret();
	cookies.set(SETUP_COOKIE, encrypt(JSON.stringify({ userId, secret })), {
		path: SETUP_PATH,
		httpOnly: true,
		secure: !dev,
		sameSite: 'lax',
		maxAge: 60 * 10
	});

	return secret;
}

export function readTotpSetup(cookies: Cookies, userId: string): string | null {
	const cookie = cookies.get(SETUP_COOKIE);

	if (!cookie)
		return null;
	let parsed;
	try {
		parsed = setupSchema.safeParse(JSON.parse(decrypt(cookie)));
	} catch {
		return null;
	}
	if (parsed.error || parsed.data.userId !== userId)
		return null;
	return parsed.data.secret;
}

export function clearTotpSetup(cookies: Cookies): void {
	cookies.delete(SETUP_COOKIE, {
		path: SETUP_PATH,
		httpOnly: true,
		secure: !dev,
		sameSite: 'lax'
	});
}

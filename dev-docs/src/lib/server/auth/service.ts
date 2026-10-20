import type { LoginInput, RegisterInput } from '#lib/schemas/auth.js';
import { createUser, findUserByEmail, isUniqueViolation } from '#lib/server/db/users.js';
import { getDummyHash, hashPassword, verifyPassword } from './password.js';
import { createSession } from './session.js';

type AuthSuccess = { ok: true; token: string; expiresAt: Date};

export type RegisterResult = AuthSuccess | { ok: false; code: 'EMAIL_TAKEN' };
export type LoginResult = AuthSuccess | { ok: false; code: 'INVALID_CREDENTIALS' };

export async function registerUSer(input: RegisterInput): Promise<RegisterResult> {
	if (await findUserByEmail(input.email)) return { ok: false, code: 'EMAIL_TAKEN' }; //change for confirmation email
	
	let user;
	try {
		user = await createUser({
			email: input.email,
			displayName: input.displayName,
			passwordHash: await hashPassword(input.password)
		});
	} catch (error) {
		if (isUniqueViolation(error)) return {ok: false, code: 'EMAIL_TAKEN'}; // change for confirmation email
		throw error;
	}
	const { token, session } = await createSession(user.id);

	return { ok: true, token, expiresAt: session.expiresAt };
}

export async function loginUser(input: LoginInput): Promise<LoginResult> {
	const user = await findUserByEmail(input.email);
	if (!user || !user.passwordHash) {
		await verifyPassword(await getDummyHash(), input.password);
		return { ok:false, code: 'INVALID_CREDENTIALS' };
	}

	if (!(await verifyPassword(user.passwordHash, input.password))) return { ok: false, code: 'INVALID_CREDENTIALS' };
	
	const { token, session } = await createSession(user.id);

	return { ok: true, token, expiresAt: session.expiresAt };
}

import { json } from '@sveltejs/kit';
import { db } from '#lib/server/db/client.js';
import * as user from '#lib/server/db/users.js';
import * as session from '#lib/server/db/sessions.js';
import {registerSchema } from '#lib/schemas/auth.js';
import { hashPassword, verifyPassword } from '#lib/server/auth/password.js';
import { createSession, validateSession, invalidateUserSession } from '#lib/server/auth/session.ts';

export async function GET() {

	const usr: user.User = await user.createUser({
		email: 'test@test.fr',
		displayName: 'test',
		passwordHash: 'loliasdfasdf'
	});

	const parsedValue = registerSchema.safeParse({ email: 'Jean@Gmail.COM', displayName: 'Jean', password: 'a', passwordConfirm: 'b' });
	const hashedPassword = await hashPassword('correcthorsebattery');
	const saledPassword = await hashPassword('correcthorsebattery');
	const trueVerified = await verifyPassword(hashedPassword, 'correcthorsebattery');
	const falseVerified = await verifyPassword(hashedPassword, 'correthorsebattery');
	const { token, session: ssion} = await createSession(usr.id);
	const validated = await validateSession(token);
	const notValidated = await validateSession(token.slice(0, -1) + 'x');

	invalidateUserSession(usr.id);
	await db.orm.public.User.where({ email: 'test@test.fr' }).delete();
	return ( json({
		usr,
		token,
		ssion,
		validated,
		notValidated: notValidated,
		isAnError: false,
		isUniqueViolationError: false,
		ZodError: parsedValue.error?.issues.map((i) => i.path.join('.') + ': ' + i.message),
		hashedPassword,
		saledPassword,
		trueVerified,
		falseVerified
	}));
	
}

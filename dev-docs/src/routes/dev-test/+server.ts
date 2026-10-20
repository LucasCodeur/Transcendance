import { json } from '@sveltejs/kit';
import { db } from '#lib/server/db/client.js';
import * as user from '#lib/server/db/users.js';
import * as session from '#lib/server/db/sessions.js';
import {registerSchema } from '#lib/schemas/auth.js';
import { hashPassword, verifyPassword } from '#lib/server/auth/password.js';

export async function GET() {

	await db.orm.public.User.where({ email: 'test@test.fr' }).delete();
	const usr: user.User = await user.createUser({
		email: 'test@test.fr',
		displayName: 'test',
		passwordHash: 'loliasdfasdf'
	});
	const ssion: session.Session = await session.insertSession({
		id: 'testSession',
		userId: usr.id,
		expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
		totpPending: false
	});

	const search = await session.findSessionWithUser(ssion.id);
	await db.orm.public.User.where({ email: 'test@test.fr' }).delete();
	await session.deleteUserSessions(usr.id);
	const parsedValue = registerSchema.safeParse({ email: 'Jean@Gmail.COM', displayName: 'Jean', password: 'a', passwordConfirm: 'b' });
	const hashedPassword = await hashPassword('correcthorsebattery');
	const saledPassword = await hashPassword('correcthorsebattery');
	const trueVerified = await verifyPassword(hashedPassword, 'correcthorsebattery');
	const falseVerified = await verifyPassword(hashedPassword, 'correthorsebattery');
	return ( json({
		usr,
		ssion,
		userWithSearch: search ? search.user : null,
		sessionWithSearch: search ? search.session: null,
		isAnError: false,
		isUniqueViolationError: false,
		ZodError: parsedValue.error?.issues.map((i) => i.path.join('.') + ': ' + i.message),
		hashedPassword,
		saledPassword,
		trueVerified,
		falseVerified
	}));
}

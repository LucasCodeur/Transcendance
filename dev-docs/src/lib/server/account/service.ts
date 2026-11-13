import type { ChangePasswordInput, ProfileInput, SetPasswordInput } from '#lib/schemas/account.ts';
import { hashPassword, verifyPassword } from '#lib/server/auth/password.ts';
import { invalidateOtherUserSessions } from '#lib/server/auth/session.ts';
import { 
			findUserById,
			setUserPasswordHashIfEmpty,
			updateUserDisplayName,
			updateUserPasswordHash
} from '#lib/server/db/users.ts';

export type SetPasswordResult = { ok: true } | { ok: false; code: 'PASSWORD_ALREADY_SET' };
export type ChangePasswordResult = { ok: true } | { ok: false; code: 'NO_PASSWORD' | 'WRONG_PASSWORD' };

export async function updateProfile(userId: string, input: ProfileInput): Promise<void> {
	await updateUserDisplayName(userId, input.displayName);
}

export async function setPassword(userId: string, currentSessionId: string, input: SetPasswordInput): Promise<SetPasswordResult> {
	const passwordHash = await hashPassword(input.password);

	if (!(await setUserPasswordHashIfEmpty(userId, passwordHash)))
		return { ok: false, code: 'PASSWORD_ALREADY_SET' };
	await invalidateOtherUserSessions(userId, currentSessionId);
	return { ok: true };
}

export async function changePassword(userId: string, currentSessionId: string, input: ChangePasswordInput): Promise<ChangePasswordResult> {
	const user = await findUserById(userId)

	if (!user?.passwordHash) return { ok: false, code: 'NO_PASSWORD' };

	if (!(await verifyPassword(user.passwordHash, input.currentPassword))) return { ok: false, code: 'WRONG_PASSWORD' };

	await updateUserPasswordHash(userId, await hashPassword(input.password));
	await invalidateOtherUserSessions(userId, currentSessionId);

	return { ok: true };
}

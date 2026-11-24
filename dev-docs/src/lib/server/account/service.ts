import { randomUUID } from 'node:crypto';
import type { ChangePasswordInput, ProfileInput, SetPasswordInput } from '#lib/schemas/account.ts';
import type { AvatarInput } from '#lib/schemas/avatar.ts';
import { hashPassword, verifyPassword } from '#lib/server/auth/password.ts';
import { invalidateOtherUserSessions } from '#lib/server/auth/session.ts';
import { deleteUserMedia, findMediaById, replaceUserAvatar, type Media } from '#lib/server/db/media.ts';
import { 
			findUserById,
			setUserPasswordHashIfEmpty,
			updateUserDisplayName,
			updateUserPasswordHash
} from '#lib/server/db/users.ts';
import { toAvatarImage } from '#lib/server/media/image.ts';
import { deleteObject, putObject } from '#lib/server/storage/storage.ts';

export type UpdateAvatarResult = { ok: true } | { ok: false; code: 'INVALID_IMAGE' | 'CONFLICT' };
export type RemoveAvatarResult = { ok: true } | { ok: false; code: 'NO_AVATAR' | 'CONFLICT' };
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

export async function updateAvatar(userId: string, input: AvatarInput): Promise<UpdateAvatarResult> {
	const image = await toAvatarImage(new Uint8Array(await input.avatar.arrayBuffer()));

	if (!image) return { ok: false, code: 'INVALID_IMAGE' };

	const currentId = (await findUserById(userId))?.avatarId ?? null;
	const current = currentId ? await findMediaById(currentId) : null;

	const storageKey = `avatars/${randomUUID()}`;
	
	await putObject(storageKey, image.bytes);

	let media: Media | null;

	try {
		media = await replaceUserAvatar(userId, currentId, {
			ownerId: userId,
			kind: 'avatar',
			mimeType: image.mimeType,
			size: image.bytes.length,
			storageKey: storageKey
		});
	} catch (error) {
		await deleteObject(storageKey);
		throw error;
	}

	if (!media) {
		await deleteObject(storageKey);
		return { ok: false, code: 'CONFLICT' };
	}

	if (current) await deleteObject(current.storageKey);

	return { ok: true };
}

export async function removeAvatar(userId: string): Promise<RemoveAvatarResult> {
	const currentId = (await findUserById(userId))?.avatarId ?? null;

	if (!currentId) return { ok: false, code: 'NO_AVATAR' };

	const current = await findMediaById(currentId);

	if (!current || !(await deleteUserMedia(userId, currentId)))
		return { ok: false, code: 'CONFLICT' };

	await deleteObject(current.storageKey);

	return { ok: true };
}

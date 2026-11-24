import { db } from './client.ts';

export type MediaKind = 'avatar';
export type Media = {
	id: string;
	ownerId: string;
	kind: MediaKind;
	mimeType: string;
	size: number;
	storageKey: string;
	createdAt: Date
};
export type NewMedia = Omit<Media, 'id' | 'createdAt'>;
export type MediaRow = Omit<Media, 'kind' | 'createdAt'> & { kind: string; createdAt: string };

class AvatarChangedError extends Error {}

function toMedia(row: MediaRow): Media {
	return {
		...row,
		kind: row.kind as MediaKind,
		createdAt: new Date(row.createdAt)
	};
}

export async function findMediaById(id: string): Promise<Media | null> {
	const row = await db.orm.public.Media.first({ id });

	return row ? toMedia(row) : null;
}

export async function replaceUserAvatar(userId: string, expected: string | null, media: NewMedia): Promise<Media | null> {
	try {
		return await db.transaction(async (tx) => {
			const user = tx.orm.public.User.where({ id: userId });
			const guarded = expected === null ? user.where((u) => u.avatarId.isNull()) : user.where({ avatarId: expected });

			if ((await guarded.updateAndCount({ avatarId: expected})) !== 1) throw new AvatarChangedError();

			const row: MediaRow = await tx.orm.public.Media.create(media);

			await user.updateAndCount({ avatarId: row.id });
			if (expected !== null) await tx.orm.public.Media.where({ id: expected }).deleteAll();

			return toMedia(row);
		})
	} catch (error) {
		if (error instanceof AvatarChangedError) return null;
		throw error;
	}
}

export async function deleteUserMedia(ownerId: string, id: string): Promise<boolean> {
	const count = await db.orm.public.Media.where({ id, ownerId }).deleteAndCount();

	return count === 1;
}

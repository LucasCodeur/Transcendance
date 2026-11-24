import { findMediaById, type Media } from '#lib/server/db/media.ts';
import { getObject } from '#lib/server/storage/storage.ts';

export type MediaFile = { bytes: Uint8Array<ArrayBuffer>; mimeType: string };

function canRead(media: Media): boolean {
	return media.kind === 'avatar';
}

export async function getMediaFile(id: string): Promise<MediaFile | null> {
	const media = await findMediaById(id);

	if (!media || !canRead(media)) return null;
	
	const bytes = await getObject(media.storageKey);

	if (bytes) return { bytes, mimeType: media.mimeType };
	
	return null;
}

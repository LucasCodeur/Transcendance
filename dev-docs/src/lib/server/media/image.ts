import { fileTypeFromBuffer } from 'file-type';
import sharp from 'sharp';
import { AVATAR_TYPES } from '#lib/schemas/avatar.ts';

const AVATAR_SIZE = 256;

const MAX_INPUT_PIXELS = 25_000_000;

export type ProcessedImage = { bytes: Uint8Array<ArrayBuffer>; mimeType: 'image/webp' };

export async function toAvatarImage(input: Uint8Array): Promise<ProcessedImage | null> {
	const detected = await fileTypeFromBuffer(input);

	if (!detected || !AVATAR_TYPES.some((type) => type === detected.mime)) return null;

	try {
		const output = await sharp(input, { limitInputPixels: MAX_INPUT_PIXELS, autoOrient: true })
			.resize(AVATAR_SIZE, AVATAR_SIZE, { fit: 'cover' })
			.webp({ quality: 80 })
			.toBuffer();
		
		return { bytes: new Uint8Array(output), mimeType: 'image/webp' };
	} catch {
		return null;
	}
}

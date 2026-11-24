import { z } from 'zod';

export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;
export const AVATAR_TYPES  = [
	'image/png',
	'image/jpeg',
	'image/webp'
] as const;

export const avatarSchema = z.object({
	avatar: z
			.file({ error: 'Choose an image.' })
			.min(1, 'Choose an image.')
			.max(AVATAR_MAX_BYTES, 'The image must be 2 MB or smaller.')
			.mime([...AVATAR_TYPES], 'Use a PNG, JPEG or WebP image.')
});

export type AvatarInput = z.infer<typeof avatarSchema>;

import { z } from 'zod';

const organame = z
	.string()
	.regex(/^[a-zA-Z]+$/, 'organization name can only can contain only letter from a-z and A-Z')
	.min(3, 'Organization name must be at least 3 character')
	.max(128, 'Organization name must be at most 128 character')
;

export const orgaCreationSchema = z
	.object({
		orga_name: organame
	});

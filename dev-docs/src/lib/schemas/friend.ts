import { z } from 'zod';

export const friendRequestScheme = z
		.object({
			friendName: z.string()
				.trim()
				.regex(/^[a-zA-Z]+$/, 'Name must only contains A-Z and a-z letters')
				.min(2, 'Username must be at least 2 characters')
				.max(50, 'Username cannot exceed 50 characters')
		});

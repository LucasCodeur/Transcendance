import { z } from 'zod';

const userScheme = z.string()
				.trim()
				.regex(/^[a-zA-Z]+$/, 'Name must only contains A-Z and a-z letters')
				.min(2, 'Username must be at least 2 characters')
				.max(50, 'Username cannot exceed 50 characters');

export const friendRequestScheme = z
		.object({
			friendName: userScheme, 
		});


export const friendAcceptDenyScheme = z
		.object({
			type: z.string().trim().regex(/^(accept|deny)$/, 'type must be either \'deny\' or \'accept\''),
			friend: userScheme,
		});

export const messagesRequestScheme = z
		.object({
			from: userScheme,
			to: userScheme,
		});

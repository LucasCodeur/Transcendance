import { z } from 'zod';

export const emailSchema = z
	.string()
	.trim()
	.toLowerCase()
	.min(1, 'Email adress required')
	.max(254, 'Email adress required')
	.pipe(z.email('Invalid email adress'));

export const passwordSchema = z
	.string()
	.min(12, 'Password must contain at least 12 character')
	.max(128, 'Password cannot exceed 128 character')

export const registerSchema = z
	.object({
		email: emailSchema,
		displayName: z.string().trim().min(2, 'Username must be at least 2 character').max(50, 'Username cannot exceed 50 character'),
		password: passwordSchema,
		passwordConfirm: z.string()
	})
	.refine((data) => data.password === data.passwordConfirm, {
		message: 'The passwords are not identic',
		path: ['passwordConfirm']
	});

export const loginSchema = z
	.object({
		email: emailSchema,
		password: z.string().min(1, 'Password required')
	});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

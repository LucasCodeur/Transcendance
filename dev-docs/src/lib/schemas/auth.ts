import { z } from 'zod';

export const emailSchema = z
	.string()
	.trim()
	.toLowerCase()
	.min(1, 'Email address required')
	.max(254, 'Email address is too long')
	.pipe(z.email('Invalid email address'));

export const passwordSchema = z
	.string()
	.min(12, 'Password must contain at least 12 characters')
	.max(128, 'Password cannot exceed 128 characters');

export const displayNameSchema = z
	.string()
	.trim()
	.min(2, 'Username must be at least 2 characters')
	.max(50, 'Username cannot exceed 50 characters');

export const registerSchema = z
	.object({
		email: emailSchema,
		displayName: displayNameSchema,
		password: passwordSchema,
		passwordConfirm: z.string()
	})
	.refine((data) => data.password === data.passwordConfirm, {
		message: 'Passwords do not match',
		path: ['passwordConfirm']
	});

export const loginSchema = z
	.object({
		email: emailSchema,
		password: z.string().min(1, 'Password required')
	});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

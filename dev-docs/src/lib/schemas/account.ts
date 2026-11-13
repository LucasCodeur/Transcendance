import { z } from 'zod';
import { displayNameSchema, passwordSchema } from './auth.ts';

export const profileSchema = z.object({
	displayName: displayNameSchema,
});

export const setPasswordSchema = z
	.object({
		password: passwordSchema,
		passwordConfirm: z.string(),
	}).refine((data) => data.password === data.passwordConfirm, {
		message: 'Passwords do not match',
		path: ['passwordConfirm']
	});

export const changePasswordSchema = z
	.object({
		currentPassword: z.string().min(1, 'Current password required'),
		password: passwordSchema,
		passwordConfirm: z.string()
	}).refine((data) => data.currentPassword !== data.password, {
		message: 'Passwords do not match',
		path: ['passwordConfirm']
	})
	.refine((data) => data.password === data.passwordConfirm, {
		message: 'The new password must be different from the current one',
		path: ['password']
	});

export type ProfileInput = z.infer<typeof profileSchema>;
export type SetPasswordInput = z.infer<typeof setPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

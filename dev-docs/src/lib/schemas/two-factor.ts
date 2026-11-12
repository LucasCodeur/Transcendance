import { z } from 'zod';

const TOTP_CODE = /^\d{6}$/;
const RECOVERY_CODE = /^[A-Z2-7]{16}$/;

function normalizeCode(value: string): string {
	return (value.replace(/[\s-]/g, '').toUpperCase());
}

export const totpCodeSchema = z.object({
	code: z
		.string()
		.transform(normalizeCode)
		.pipe(z.string().regex(TOTP_CODE, 'Enter the 6-digit code from your app'))
});

export const secondFactorSchema = z.object({
	code: z
		.string()
		.transform(normalizeCode)
		.refine(
			(code) => TOTP_CODE.test(code) || RECOVERY_CODE.test(code),
			'Enter the 6-digit code from your app or a recovery code'
		)
});

export function isTotpCode(code: string): boolean {
	return TOTP_CODE.test(code);
}

export type TotpCodeInput = z.infer<typeof totpCodeSchema>;
export type SecondFactorInput = z.infer<typeof secondFactorSchema>;

import { createHash } from 'node:crypto';
import { isTotpCode } from '#lib/schemas/two-factor.js';
import {
		advanceTotpStep,
		consumeRecoveryCode,
		countRecoveryCode,
		disableUserTotp,
		enableUserTotp,
		replaceRecoveryCodes
} from '#lib/server/db/two-factor.js';
import { findUserById } from '#lib/server/db/users.js';
import { decrypt, encrypt } from './encryption.js';
import { generateRecoveryCodes, totpQRCode, totpURI, verifyTotp } from './totp.js';

export type TotpSetup = { secret: string; uri: string; qrCode: string };

export type EnableResult =
	| { ok: true; recoveryCodes: string[] }
	| { ok: false; code: 'INVALID_CODE' | 'ALREADY_ENABLED' };

export type VerifyResult = { ok: true, usedRecoveryCode: boolean } | { ok: false; code: 'INVALID_CODE' };

export type DisableResult = { ok: true } | { ok: false; code: 'INVALID_CODE' | 'NOT_ENABLED' };

export type RegenerateResult =
	| { ok: true; recoveryCodes: string[] }
	| { ok: false; code: 'INVALID_CODE' | 'NOT_ENABLED' };

function hashRecoveryCode(code: string): string {
	return createHash('sha256').update(code.replaceAll('-', '')).digest('hex');
}

export async function getTwoFactorStatus(userId: string): Promise<{ enabled: boolean; recoveryCodesLeft: number }> {
	const user = await findUserById(userId);

	return { enabled: Boolean(user?.totpSecret), recoveryCodesLeft: await countRecoveryCode(userId) };
}

export async function describeTotpSetup(secret: string, email: string): Promise<TotpSetup> {
	const uri = totpURI(secret, email);

	return {
		secret,
		uri,
		qrCode: await totpQRCode(uri)
	}
}

export async function enableTwoFactor(userId: string, secret: string, code: string): Promise<EnableResult> {
	const user = await findUserById(userId);

	if (!user) return { ok: false, code: 'INVALID_CODE' };

	if (user.totpSecret) return { ok: false, code: 'ALREADY_ENABLED' };
	
	const step = verifyTotp(secret, code, null);
	if (!step)
		return { ok: false, code: 'INVALID_CODE' };

	const recoveryCodes = generateRecoveryCodes();
	await enableUserTotp(userId, encrypt(secret), step, recoveryCodes.map(hashRecoveryCode));

	return { ok: true, recoveryCodes };
}

export async function verifySecondFactor(userId: string, code: string): Promise<VerifyResult> {
	const user = await findUserById(userId);
	if (!user?.totpSecret) return { ok: false, code: 'INVALID_CODE' };

	if (!isTotpCode(code)) {
		if (await consumeRecoveryCode(userId, hashRecoveryCode(code)))
			return { ok: true, usedRecoveryCode: true };
		return { ok: false, code: 'INVALID_CODE' };
	}
	
	const step = verifyTotp(decrypt(user.totpSecret), code, user.totpLastStep);
	if (!step)
		return { ok: false, code: 'INVALID_CODE' };
	
	if (!(await advanceTotpStep(userId, step)))
		return { ok: false, code: 'INVALID_CODE' };
	
	return { ok: true, usedRecoveryCode: false };
}

export async function disableTwoFactor(userId: string, code: string): Promise<DisableResult> {
	const status = await getTwoFactorStatus(userId);
	if (!status.enabled) return { ok: false, code: 'NOT_ENABLED' };
	
	const verified = await verifySecondFactor(userId, code);
	if (!verified.ok) return verified;

	await disableUserTotp(userId);

	return { ok: true };
}

export async function regenerateRecoveryCodes(userId: string, code: string): Promise<RegenerateResult> {
	const status = await getTwoFactorStatus(userId);
	if (!status.enabled) return { ok: false, code: 'NOT_ENABLED' };
	
	const verified = await verifySecondFactor(userId, code);
	if (!verified.ok) return verified;

	const recoveryCodes = generateRecoveryCodes();
	await replaceRecoveryCodes(userId, recoveryCodes.map(hashRecoveryCode));

	return { ok: true, recoveryCodes };
}

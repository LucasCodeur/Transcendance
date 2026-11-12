import { db } from './client.ts';

export async function enableUserTotp(
	userId: string,
	encryptedSecret: string,
	lastStep: number,
	recoveryCodeHashes: string[]
): Promise <void> {
	return db.transaction(async (tx) => {
		await tx.orm.public.User.where({ id: userId }).update({ totpSecret: encryptedSecret, totpLastStep: lastStep });
		await tx.orm.public.RecoveryCode.where({ userId }).deleteAll();
		for (const codeHash of recoveryCodeHashes) {
			await tx.orm.public.RecoveryCode.create({ userId, codeHash });
		}
	});
}

export async function disableUserTotp(userId: string): Promise<void> {
	return db.transaction(async (tx) => {
		await tx.orm.public.User.where({ id: userId }).update({ totpSecret: null, totpLastStep: null });
		await tx.orm.public.RecoveryCode.where({ userId }).deleteAll();
	});
}

export async function advanceTotpStep(userId: string, step: number): Promise<boolean> {
	const count = await db.orm.public.User
					.where({ id: userId })
					.where((u) => u.totpLastStep.lt(step))
					.updateAndCount({ totpLastStep: step });
	return count === 1;
}

export async function replaceRecoveryCodes(userId: string, recoveryCodeHashes: string[]): Promise<void> {
	return db.transaction(async (tx) => {
		await tx.orm.public.RecoveryCode.where({ userId }).deleteAll();
		for (const codeHash of recoveryCodeHashes) {
			await tx.orm.public.RecoveryCode.create({ userId, codeHash });
		}
	});
}

export async function consumeRecoveryCode(userId: string, codeHash: string): Promise<boolean> {
	const count = await db.orm.public.RecoveryCode.where({ userId, codeHash }).deleteAndCount();
	return count === 1;
}

export async function countRecoveryCode(userId: string): Promise<number> {
	const result = await db.orm.public.RecoveryCode.where({ userId }).aggregate((a) => ({ count: a.count() }));
	return result.count;
}

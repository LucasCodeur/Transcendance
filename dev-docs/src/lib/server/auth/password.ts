import { randomBytes } from 'node:crypto';
import { hash, verify } from '@node-rs/argon2';

const ARGON2ID = 2;
const OPTIONS = {
	algorithm: ARGON2ID,
	memoryCost: 19456, // 19MB
	timeCost: 2,
	parallelism: 1,
	outputLen: 32
};

export function hashPassword(plain: string): Promise<string> {
	return hash(plain, OPTIONS);
}

export async function verifyPassword(stored: string, plain: string): Promise<boolean> {
	try {
		return await verify(stored, plain, OPTIONS);
	} catch {
		return false;
	}
}

let dummyHash: Promise<string> | null = null;

export function getDummyHash(): Promise<string> {
	dummyHash ??= hashPassword(randomBytes(32).toString('hex'));
	return dummyHash;
}

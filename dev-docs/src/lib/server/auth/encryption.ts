import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { TOTP_ENCRYPTION_KEY } from '$app/env/private';

const ALGORITHM = 'aes-256-gcm';
const IV_BYTES = 12;
const key = Buffer.from(TOTP_ENCRYPTION_KEY, 'base64');

export function encrypt(plaintext: string): string {
	const iv = randomBytes(IV_BYTES);
	const cipher = createCipheriv(ALGORITHM, key, iv);
	const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
	const tag = cipher.getAuthTag();

	return [iv, tag, ciphertext].map((part) => part.toString('base64url')).join('.');
}

export function decrypt(payload: string): string {
	const [ iv, tag, ciphertext ] = payload.split('.').map((part) => Buffer.from(part, 'base64url'));

	if (!iv || !tag || !ciphertext) throw new Error('Malformed encrypted payload');
	
	const decipher = createDecipheriv(ALGORITHM, key, iv);
	decipher.setAuthTag(tag);

	return Buffer.concat([decipher.update(ciphertext, 'utf8'), decipher.final()]).toString('utf8');
}

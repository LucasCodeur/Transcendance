import { Secret, TOTP } from 'otpauth';
import QRCode from 'qrcode';

const ISSUER = "ft_transcendence";
const RECOVERY_CODE_COUNT = 10;

function createTotp(secret: string, label: string): TOTP {
	return new TOTP({
		issuer: ISSUER,
		label,
		algorithm: 'SHA1',
		digits: 6,
		period: 30,
		secret: Secret.fromBase32(secret)
	});
}

export function generateTotpSecret(): string {
	return new Secret({ size: 20 }).base32;
}

export function totpURI(secret: string, email: string): string {
	return createTotp(secret, email).toString();
}

export async function totpQRCode(uri: string): Promise<string> {
	return QRCode.toDataURL(uri, { margin: 1, width: 224 });
}

export function verifyTotp(secret: string, code: string, lastStep: number | null): number | null {
	const totp = createTotp(secret, '');
	const delta = totp.validate({ token: code, window: 1, afterCounter: lastStep });

	if (delta === null) return null;
	
	return totp.counter() + delta;
}

export function generateRecoveryCodes(): string[] {
	let codes: string[] = [];

	for (let i = 0; i < RECOVERY_CODE_COUNT; i++) {
		const code = new Secret({ size: 10 }).base32;
		codes.push(code.match(/.{4}/g)!.join('-'));
	}

	return codes;
}

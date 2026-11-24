import { defineEnvVars } from '@sveltejs/kit/env';
import { z } from 'zod';

const secret = z.string().min(1);

export const variables = defineEnvVars({
	ORIGIN: { schema: z.url(), description: 'Public URL of the app, used to build OAuth redirect URIs' },
	FORTYTWO_CLIENT_ID: { schema: secret },
	FORTYTWO_CLIENT_SECRET: { schema: secret },
	GITHUB_CLIENT_ID: { schema: secret },
	GITHUB_CLIENT_SECRET: { schema: secret },
	TOTP_ENCRYPTION_KEY: {
		schema: z
			.base64()
			.refine((key) => Buffer.from(key, 'base64').length === 32, 'Must be 32 bytes, base64 encoded (openssl rand -base64 32)'),
		description: 'AES-256 key that encrypts TOTP secrets in the database'
	},
	UPLOAD_DIR: {
		schema: z.string().min(1),
		description: 'Directory where uploaded files are stored.'
	}
});

import { defineEnvVars } from '@sveltejs/kit/env';
import { z } from 'zod';

const secret = z.string().min(1);

export const variables = defineEnvVars({
	ORIGIN: { schema: z.url(), description: 'Public URL of the app, used to build OAuth redirect URIs' },
	FORTYTWO_CLIENT_ID: { schema: secret },
	FORTYTWO_CLIENT_SECRET: { schema: secret },
	GITHUB_CLIENT_ID: { schema: secret },
	GITHUB_CLIENT_SECRET: { schema: secret }
});

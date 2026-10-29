import { z } from 'zod';

export const oauthProviderSchema = z.enum(['fortytwo', 'github'])

export const OAUTH_PROVIDER_LABELS : Record<OAuthProvider, string> = {

    fortytwo: '42',
    github: 'Github',
};

export type OAuthProvider = z.infer<typeof oauthProviderSchema>

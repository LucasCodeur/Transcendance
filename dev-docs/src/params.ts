import { defineParams } from '@sveltejs/kit/params';
import { oauthProviderSchema } from './lib/schemas/oauth.ts';

export const params = defineParams ({
    provider : oauthProviderSchema
});
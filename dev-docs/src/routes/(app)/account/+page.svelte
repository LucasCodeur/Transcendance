<script lang="ts">
	import type { PageProps } from './$types';
	import { oauthProviderSchema, OAUTH_PROVIDER_LABELS } from '#lib/schemas/oauth.ts';

	let { data, form }: PageProps = $props();
</script>

<h1 class="text-2x1 font-bold">Mon compte</h1>
<p>username: {data.user.displayName}</p>
<p>email: {data.user.email}</p>
<p>emailVerified: {data.user.emailVerified ? 'true' : 'false'}</p>
<a href="/account/security"
	class="mt-4 inline-block rounded bg-emerald-700 px-3 py-1 text-white hover:bg-emerald-800"
>
	Security
</a>

{#if data.message}
	<p>{data.message}</p>
{/if}

{#if data.linked}
	<p>{OAUTH_PROVIDER_LABELS[data.linked]} linked.</p>
{/if}

{#if form?.message}
	<p>{form.message}</p>
{/if}

{#each oauthProviderSchema.options as provider}
    {@const isLinked = data.loginMethods.providers.includes(provider)}

    <form method="POST" action={isLinked ? '?/unlink' : '?/link'}>
        <input type="hidden" name="provider" value={provider} />
        <button>{isLinked ? 'Unlink' : 'Link'} {OAUTH_PROVIDER_LABELS[provider]}</button>
    </form>
{/each}
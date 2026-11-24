<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { z } from 'zod';
	import CircleAlertIcon from '@lucide/svelte/icons/circle-alert';
	import { loginSchema } from '#lib/schemas/auth.js';
	import { OAUTH_PROVIDER_LABELS, oauthProviderSchema } from '#lib/schemas/oauth.js';
	import AuthCard from '#lib/components/AuthCard.svelte';
	import FormField from '#lib/components/FormField.svelte';
	import OAuthProviderIcon from '#lib/components/OAuthProviderIcon.svelte';
	import * as Alert from '#lib/components/ui/alert/index.ts';
	import { Button } from '#lib/components/ui/button/index.ts';
	import type { PageProps } from './$types';

	let { form, data }: PageProps = $props();

	let clientErrors = $state<Record<string, string[] | undefined>>({});
	let submitting = $state(false);

	const redirectTo = $derived(page.url.searchParams.get('redirectTo'));
	const redirectSuffix = $derived(redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : '');

	const errors = $derived<Record<string, string[] | undefined>>({
		...(form?.errors ?? {}),
		...clientErrors
	});
</script>

<svelte:head>
	<title>Log in</title>
</svelte:head>

<AuthCard title="Log in" description="Welcome back. Choose how you want to sign in.">
	{#if data.oauthError}
		<Alert.Root variant="destructive">
			<CircleAlertIcon aria-hidden="true" />
			<Alert.Description>{data.oauthError}</Alert.Description>
		</Alert.Root>
	{/if}

	<div class="flex flex-col gap-2">
		{#each oauthProviderSchema.options as provider (provider)}
			<Button href="/oauth/{provider}{redirectSuffix}" variant="outline" class="w-full">
				<OAuthProviderIcon {provider} class="size-4" />
				Continue with {OAUTH_PROVIDER_LABELS[provider]}
			</Button>
		{/each}
	</div>

	<div class="flex items-center gap-3 text-xs text-muted-foreground uppercase" aria-hidden="true">
		<span class="h-px flex-1 bg-border"></span>
		or
		<span class="h-px flex-1 bg-border"></span>
	</div>

	<form
		method="POST"
		novalidate
		class="flex flex-col gap-4"
		use:enhance={({ formData, cancel }) => {
			const parsed = loginSchema.safeParse(Object.fromEntries(formData));
			if (!parsed.success) {
				clientErrors = z.flattenError(parsed.error).fieldErrors;
				cancel();
				return;
			}
			clientErrors = {}
			submitting = true;
			return async ({ update }) => {
				await update();
				submitting = false;
			};
		}}
	>
		{#if form?.error}
			<Alert.Root variant="destructive">
				<CircleAlertIcon aria-hiddent="true" />
				<Alert.Description>{form.error}</Alert.Description>
			</Alert.Root>
		{/if}
		
		<FormField
			id="email"
			name="email"
			type="email"
			label="email"
			autocomplete="email"
			value={form?.email ?? ''}
			errors={errors.email}
		/>

		<FormField
			id="password"
			name="password"
			type="password"
			label="password"
			autocomplete="current-password"
			errors={errors.password}
		/>

		<Button type="submit" class="w-full" disabled={submitting}>
			{submitting ? 'Logging in...' : 'Log in'}
		</Button>
	</form>
	{#snippet footer()}
		<p>Don't have an account? <a href="/register" class="font-medium text-foreground underline underline-offset-4">Sign up</a></p>
	{/snippet}
</AuthCard>

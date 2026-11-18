<script lang="ts">
	import { enhance } from '$app/forms';
	import { z } from 'zod';
	import CircleAlertIcon from '@lucide/svelte/icons/circle-alert';
	import CircleCheckIcon from '@lucide/svelte/icons/circle-check';
	import KeyRoundIcon from '@lucide/svelte/icons/key-round';
	import { profileSchema } from '#lib/schemas/account.js';
	import { OAUTH_PROVIDER_LABELS, oauthProviderSchema } from '#lib/schemas/oauth.js';
	import FormField from '#lib/components/FormField.svelte';
	import OAuthProviderIcon from '#lib/components/OAuthProviderIcon.svelte';
	import * as Alert from '#lib/components/ui/alert/index.js';
	import * as Avatar from '#lib/components/ui/avatar/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Card from '#lib/components/ui/card/index.js';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	let clientErrors = $state<Record<string, string[] | undefined>>({});
	let savingProfile = $state(false);
	
	const profileErrors = $derived<Record<string, string[] | undefined>>({
		...(form?.action === 'profile' && 'errors' in form ? form.errors : {}),
		...clientErrors });
	const profileMessage = $derived(form?.action === 'profile' && 'message' in form ? form.message : null);
	const providerError = $derived(form?.action === 'provider' && 'error' in form ? form.error : null);
	const providerMessage = $derived(form?.action === 'provider' && 'message' in form ? form.error : null);

	const displayNameValue = $derived(form?.action === 'profile' && 'displayName' in form ? form.displayName : null);
	
	const canUnlink = $derived(data.loginMethods.hasPassword || data.loginMethods.providers.length > 1);
	const initials = $derived(
		data.user.displayName
		.split(/\s+/)
		.map((word) => word[0])
		.join('')
		.slice(0, 2)
		.toUpperCase()
	);
</script>

<svelte:head><title>Profile · Account settings</title></svelte:head>

{#if data.message}
	<Alert.Root variant="destructive">
		<CircleAlertIcon aria-hidden="true" />
		<Alert.Description>{data.message}</Alert.Description>
	</Alert.Root>
{/if}

{#if data.linked}
	<Alert.Root role="status">
		<CircleCheckIcon aria-hidden="true" />
		<Alert.Description>{OAUTH_PROVIDER_LABELS[data.linked]} account linked.</Alert.Description>
	</Alert.Root>
{/if}

<Card.Root>
	<Card.Header>
		<Card.Title><h2>Profile</h2></Card.Title>
		<Card.Description>This is how other members see you.</Card.Description>
	</Card.Header>

	<Card.Content class="flex flex-col gap-6">
		<div class="flex items-center gap-4">
			<Avatar.Root size="lg">
				<Avatar.Fallback>{initials}</Avatar.Fallback>
			</Avatar.Root>
			<div class="flex min-w-0 flex-col gap-1">
				<p class="truncate font-medium">{data.user.displayName}</p>
				<div class="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
					<span class="truncate">{data.user.email}</span>
					{#if data.user.emailVerified}
						<Badge variant="secondary">Verified</Badge>
					{:else}
						<Badge variant="outline">Not verified</Badge>
					{/if}
				</div>
			</div>
		</div>
		<form
			method="POST"
			action="?/profile"
			novalidate
			class="flex flex-col gap-3"
			use:enhance={({ formData, cancel }) => {
				const parsed = profileSchema.safeParse(Object.fromEntries(formData));
				if (!parsed.success) {
					clientErrors = z.flattenError(parsed.error).fieldErrors;
					cancel();
					return;
				}
				clientErrors = {}
				savingProfile = true;
				return async ({ update }) => {
					await update({ reset: false });
					savingProfile = false;
				};
			}}
		>
			{#if profileMessage}
				<Alert.Root role="status">
					<CircleCheckIcon aria-hidden="true" />
					<Alert.Description>{profileMessage}</Alert.Description>
				</Alert.Root>
			{/if}
			<FormField
				id="displayName"
				name="displayName"
				label="Display Name"
				autocomplete="nickname"
				value={displayNameValue}
				errors={profileErrors.displayName}
			/>
			<Button type="submit" class="self-start" disabled={savingProfile}>
				{savingProfile ? 'Saving...' : 'Save'}
			</Button>
		</form>
	</Card.Content>
</Card.Root>

<Card.Root>
	<Card.Header>
		<Card.Title><h2>Sign-in methods</h2></Card.Title>
		<Card.Description>The ways you can log in to your account.</Card.Description>
	</Card.Header>

	<Card.Content class="flex flex-col gap-4">
		{#if providerError}
			<Alert.Root variant="destructive">
				<CircleAlertIcon aria-hidden="true" />
				<Alert.Description>{providerError}</Alert.Description>
			</Alert.Root>
		{:else if providerMessage}
			<Alert.Root role="status">
				<CircleCheckIcon aria-hidden="true" />
				<Alert.Description>{providerMessage}</Alert.Description>
			</Alert.Root>
		{/if}
		<ul class="flex flex-col divide-y">
			<li class="flex flex-wrap items-center gap-3 py-3">
				<KeyRoundIcon class="size-5 shrink-0" aria-hidden="true" />
				<span class="flex-1 font-medium">Password</span>
				<Badge variant={data.loginMethods.hasPassword ? 'secondary' : 'outline'}>
					{data.loginMethods.hasPassword ? 'Set' : 'Not set'}
				</Badge>
				<Button href="/account/security#password-settings" variant="outline" size="sm">
					{data.loginMethods.hasPassword ? 'Change' : 'Set a password'}
				</Button>
			</li>

			{#each oauthProviderSchema.options as provider (provider)}
				{@const isLinked = data.loginMethods.providers.includes(provider)}
				{@const locked = isLinked && !canUnlink}
				<li class="flex flex-wrap items-center gap-3 py-3">
					<OAuthProviderIcon {provider} class="size-5 shrink-0" />
					<span class="flex-1 font-medium">{OAUTH_PROVIDER_LABELS[provider]}</span>
					<Badge variant={isLinked ? 'secondary' : 'outline'}>{isLinked ? 'Linked' : 'Not linked'}</Badge>
					<form method="POST" action={isLinked ? '?/unlink' : '?/link'} use:enhance>
						<input type="hidden" name="provider" value={provider} />
						<Button
							type="submit"
							variant={isLinked ? 'destructive' : 'outline'}
							size="sm"
							disabled={locked}
							aria-describedby={locked ? 'last-method-hint' : undefined}
						>
							{isLinked ? 'Unlink' : 'Link'}<span class="sr-only"> {OAUTH_PROVIDER_LABELS[provider]}</span>
						</Button>
					</form>
				</li>
			{/each}
		</ul>

		{#if !canUnlink}
			<p id="last-method-hint" class="text-sm text-muted-foreground">
				This is your only way to sign in. Set a password or link another provider before unlinking it.
			</p>
		{/if}
	</Card.Content>
</Card.Root>




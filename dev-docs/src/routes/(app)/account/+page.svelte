<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { z } from 'zod';
	import CircleAlertIcon from '@lucide/svelte/icons/circle-alert';
	import CircleCheckIcon from '@lucide/svelte/icons/circle-check';
	import KeyRoundIcon from '@lucide/svelte/icons/key-round';
	import { mediaUrl } from '#lib/media.ts';
	import { profileSchema } from '#lib/schemas/account.js';
	import { AVATAR_TYPES, avatarSchema } from '#lib/schemas/avatar.ts';
	import { OAUTH_PROVIDER_LABELS, oauthProviderSchema } from '#lib/schemas/oauth.js';
	import FormField from '#lib/components/FormField.svelte';
	import OAuthProviderIcon from '#lib/components/OAuthProviderIcon.svelte';
	import * as Alert from '#lib/components/ui/alert/index.js';
	import * as Avatar from '#lib/components/ui/avatar/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Card from '#lib/components/ui/card/index.js';
	import { Input } from '#lib/components/ui/input/index.ts';
	import { Label } from '#lib/components/ui/label/index.ts';
	import { submitWithProgress } from '#lib/upload.ts';
	import type { PageProps } from './$types';
	import { getInitials } from '#lib/initials.ts';

	let { data, form }: PageProps = $props();

	let clientErrors = $state<Record<string, string[] | undefined>>({});
	let savingProfile = $state(false);
	
	const profileErrors = $derived<Record<string, string[] | undefined>>({
		...(form?.action === 'profile' && 'errors' in form ? form.errors : {}),
		...clientErrors });
	const profileMessage = $derived(form?.action === 'profile' && 'message' in form ? form.message : null);
	const providerError = $derived(form?.action === 'provider' && 'error' in form ? form.error : null);
	const providerMessage = $derived(form?.action === 'provider' && 'message' in form ? form.message : null);

	const displayNameValue = $derived(form?.action === 'profile' && 'displayName' in form ? form.displayName : data.user.displayName);
	
	const canUnlink = $derived(data.loginMethods.hasPassword || data.loginMethods.providers.length > 1);
	const initials = $derived(getInitials(data.user.displayName));
	
	let avatarClientErrors = $state<Record<string, string[] | undefined>>({});
	let selectedFile = $state<File | null>(null);
	let previewUrl = $state<string | null>(null);
	let uploadProgress = $state<number | null>(null);
	let networkError = $state<string | null>(null);
	let removingAvatar = $state(false);

	const avatarErrors = $derived<Record<string, string[] | undefined>>({
		...(form?.action === 'avatar' && 'errors' in form ? form.errors : {}),
		...avatarClientErrors
	});
	const avatarInvalid = $derived(Boolean(avatarErrors.avatar?.length));
	const avatarError = $derived(networkError ?? (form?.action === 'avatar' && 'error' in form ? form.error : null));
	const avatarMessage = $derived(form?.action === 'avatar' && 'message' in form ? form.message : null);
	const avatarSrc = $derived(previewUrl ?? (data.user.avatarId ? mediaUrl(data.user.avatarId) : null));

	$effect(() => {
		if (!selectedFile || !avatarSchema.shape.avatar.safeParse(selectedFile).success) {
			previewUrl = null;
			return;
		}

		const url = URL.createObjectURL(selectedFile);
		previewUrl = url;
		return () => URL.revokeObjectURL(url);
	});

	async function uploadAvatar(event: SubmitEvent & { currentTarget: EventTarget & HTMLFormElement }) {
		event.preventDefault();

		const formElement = event.currentTarget;
		const body = new FormData(formElement);
		const parsed = avatarSchema.safeParse({ avatar: body.get('avatar') });

		networkError = null;
		if (!parsed.success) {
			avatarClientErrors = z.flattenError(parsed.error).fieldErrors;
			return;
		}
		avatarClientErrors = {};
		uploadProgress = 0;
		try {
			const result = await submitWithProgress(formElement, body, (percent) => ( uploadProgress = percent));
			formElement.reset();
			selectedFile = null;
			if (result.type === 'success') await invalidateAll();
			await applyAction(result);
		} catch {
			networkError = 'Upload failed. Check your connection and try again.';
		} finally {
			uploadProgress = null;
		}
	}
</script>

<svelte:head><title>Profile · Account settings</title></svelte:head>

{#if data.message}
	<Alert.Root variant="destructive">
		<CircleAlertIcon aria-hidden="true" />
		<Alert.Description>{data.message}</Alert.Description>
	</Alert.Root>
{/if}

<Card.Root>
	<Card.Header>
		<Card.Title><h2>Profile</h2></Card.Title>
		<Card.Description>This is how other members see you.</Card.Description>
	</Card.Header>

	<Card.Content class="flex flex-col gap-6">
		<div class="flex items-center gap-4">
			<Avatar.Root class="size-16">
				{#if avatarSrc}
					<Avatar.Image src={avatarSrc} alt="" />
				{/if}
				<Avatar.Fallback class="text-lg">{initials}</Avatar.Fallback>
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
		<div class="flex flex-col gap-3">
			{#if avatarError}
				<Alert.Root variant="destructive">
					<CircleAlertIcon aria-hidden="true" />
					<Alert.Description>{avatarError}</Alert.Description>
				</Alert.Root>
			{:else if avatarMessage}
				<Alert.Root role="status">
					<CircleCheckIcon aria-hidden="true" />
					<Alert.Description>{avatarMessage}</Alert.Description>
				</Alert.Root>
			{/if}
			<form
				method="POST"
				action="?/avatar"
				enctype="multipart/form-data"
				novalidate
				class="flex flex-col gap-3"
				onsubmit={uploadAvatar}
			>
				<div class="flex flex-col gap-2">
					<Label for="avatar">Profile picture</Label>
					<Input
						id="avatar"
						name="avatar"
						type="file"
						accept={AVATAR_TYPES.join(',')}
						aria-invalid={avatarInvalid ? 'true' : undefined}
						aria-describedby={avatarInvalid ? 'avatar-hint avatar-error' : 'avatar-hint'}
						onchange={(event) => (selectedFile = event.currentTarget.files?.[0] ?? null)}
					/>
					<p id="avatar-hint" class="text-sm text-muted-foreground">
						{previewUrl ? 'Preview shown above. Upload it to save it.' : 'PNG, JPEG or WEBP, up to 2 MB.'}
					</p>
					{#if avatarInvalid}
						<p id="avatar-error" class="text-sm text-destructive">{avatarErrors.avatar?.[0]}</p>
					{/if}
					{#if uploadProgress !== null}
						<div class="flex items-center gap-3">
							<progress
								max="100"
								value={uploadProgress}
								aria-label="Upload progress"
								class="h-2 w-full max-w-xs overflow-hidden rounded-full [&::-moz-progress-bar]:bg-primary [&::-webkit-progress-bar]:bg-muted [&::-webkit-progress-value]:bg-primary"
							></progress>
							<span class="text-sm tabular-nums" aria-hidden="true">{uploadProgress}%</span>
						</div>
					{/if}
					<div class="flex flex-wrap gap-2">
						<Button type="submit" disabled={uploadProgress !== null}>
							{uploadProgress !== null ? 'Uploading...' : 'Upload picture'}
						</Button>
						{#if data.user.avatarId}
							<Button type="submit" form="remove-avatar-form" variant="outline" disabled={removingAvatar}>
								{removingAvatar ? 'Removing...' : 'Remove picture'}
							</Button>
						{/if}
					</div>
				</div>
			</form>
			<form
				id="remove-avatar-form"
				method="POST"
				action="?/removeAvatar"
				use:enhance={() => {
					removingAvatar = true;
					return async ({ update }) => {
						await update();
						removingAvatar = false;
					};
				}}
			></form>
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
				label="Display name"
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
		{#if data.linked}
			<Alert.Root role="status">
				<CircleCheckIcon aria-hidden="true" />
				<Alert.Description>{OAUTH_PROVIDER_LABELS[data.linked]} account linked.</Alert.Description>
			</Alert.Root>
		{/if}
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




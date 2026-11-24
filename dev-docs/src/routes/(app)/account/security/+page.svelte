<script lang="ts">
	import { enhance, type SubmitFunction } from '$app/forms';
	import { z } from 'zod';
	import CircleAlertIcon from '@lucide/svelte/icons/circle-alert';
	import CircleCheckIcon from '@lucide/svelte/icons/circle-check';
	import TriangleAlertIcon from '@lucide/svelte/icons/triangle-alert';
	import { changePasswordSchema, setPasswordSchema } from '#lib/schemas/account.ts';
	import { secondFactorSchema, totpCodeSchema } from '#lib/schemas/two-factor.ts';
	import FormField from '#lib/components/FormField.svelte';
	import * as Alert from '#lib/components/ui/alert/index.ts';
	import { Badge } from '#lib/components/ui/badge/index.ts';
	import { Button } from '#lib/components/ui/button/index.ts';
	import * as Card from '#lib/components/ui/card/index.ts';
	import { Separator } from '#lib/components/ui/separator/index.ts';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	let clientErrors = $state<{ action: string; errors: Record<string, string[] | undefined> } | null>(null);
	let pending = $state<string | null>(null);

	function errorsFor(action: string): Record<string, string[] | undefined> {
		if (clientErrors?.action === action) return clientErrors.errors;
		if (form?.action === action && 'errors' in form) return form.errors ?? {};
		return {};
	}

	function messageFor(action: string): string | null {
		return form?.action === action && 'message' in form ? (form.message ?? null) : null;
	}

	function errorFor(action: string): string | null {
		return form?.action === action && 'error' in form ? (form.error ?? null) : null;
	}

	function validate(schema: z.ZodType, action: string): SubmitFunction {
		return ({ formData, cancel }) => {
			const parsed = schema.safeParse(Object.fromEntries(formData));
			if (!parsed.success) {
				clientErrors = { action, errors: z.flattenError(parsed.error).fieldErrors };
				cancel();
				return;
			}
			clientErrors = null;
			pending = action;
			return async ({ update }) => {
				await update();
				pending = null;
			}
		}
	}

	const passwordAction = $derived(data.hasPassword ? 'changePassword' : 'setPassword');
	const recoveryCodes = $derived(form && 'recoveryCodes' in form ? form.recoveryCodes : null);
	
	const groupedSecret = $derived(data.setup?.secret.match(/.{1,4}/g)?.join(' ') ?? '');

	const twoFactorItems = [
		{
			action: 'regenerate',
			label: 'Generate new recovery codes',
			hint: 'Your old recovery codes will stop working.',
			variant: 'outline'
		},
		{
			action: 'disable',
			label: 'Turn off two-factor authentication',
			hint: 'Your account will be protected by your password only.',
			variant: 'destructive'
		}
	] as const;
</script>

<svelte:head>
	<title>Security · Account settings</title>
</svelte:head>

{#if data.notice}
	<Alert.Root role="status">
		<TriangleAlertIcon aria-hidden="true" />
		<Alert.Description>{data.notice}</Alert.Description>
	</Alert.Root>
{/if}

<Card.Root id="password-settings">
	<Card.Header>
		<Card.Title>
			<h2>Password</h2>
		</Card.Title>
		<Card.Description>
			{data.hasPassword 
				? 'Change the password you use to log in with your email.'
				: 'You sign in with a provider only. Add a password to also log in with your email.'}
		</Card.Description>
	</Card.Header>

	<Card.Content>
		{@const errors =  errorsFor(passwordAction)}
		<form
			method="POST"
			action="?/{passwordAction}"
			novalidate
			class="flex flex-col gap-4"
			use:enhance={validate(data.hasPassword ? changePasswordSchema : setPasswordSchema, passwordAction)}
		>
			{#if errorFor(passwordAction)}
				<Alert.Root variant="destructive">
					<CircleAlertIcon aria-hidden="true" />
					<Alert.Description>{errorFor(passwordAction)}</Alert.Description>
				</Alert.Root>
			{:else if messageFor(passwordAction)}
				<Alert.Root role="status">
					<CircleCheckIcon aria-hidden="true" />
					<Alert.Description>{messageFor(passwordAction)}</Alert.Description>
				</Alert.Root>
			{/if}

			<input type="email" autocomplete="username" value={data.user.email} hidden readonly/>

			{#if data.hasPassword}
				<FormField
					id="currentPassword"
					name="currentPassword"
					label="Current password"
					type="password"
					autocomplete="current-password"
					errors={errors.currentPassword}
				/>
			{/if}
			<FormField
				id="password"
				name="password"
				label="New password"
				type="password"
				autocomplete="new-password"
				hint="At least 12 characters."
				errors={errors.password}
			/>
			<FormField
				id="passwordConfirm"
				name="passwordConfirm"
				label="Confirm new password"
				type="password"
				autocomplete="new-password"
				errors={errors.passwordConfirm}
			/>
			<Button type="submit" class="self-start" disabled={pending === passwordAction}>
				{data.hasPassword ? 'Change password' : 'Set password'}
			</Button>
		</form>
	</Card.Content>
</Card.Root>

<Card.Root>
	<Card.Header>
		<Card.Title><h2>Two-factor authentication</h2></Card.Title>
		<Card.Description>Ask for a code from your phone at each login, on top of your password.</Card.Description>
		<Card.Action>
			<Badge variant={data.status.enabled ? 'secondary' : 'outline'}>{data.status.enabled ? 'On' : 'Off'}</Badge>
		</Card.Action>
	</Card.Header>

	<Card.Content class="flex flex-col gap-4">
		{#if recoveryCodes}
			<Alert.Root role="status" aria-labelledby="recovery-title">
				<TriangleAlertIcon aria-hidden="true" />
				<Alert.Title id="recovery-title">Your recovery codes</Alert.Title>
				<Alert.Description>
					<p>Save them somewhere safe now: they will not be shown again. Each code works once.</p>
					<ul class="mt-2 grid grid-cols-2 gap-1 font-mono text-foreground">
						{#each recoveryCodes as code (code)}
							<li>{code}</li>
						{/each}
					</ul>
				</Alert.Description>
			</Alert.Root>
		{/if}
		
		{#if data.status.enabled}
			<p class="text-sm">Recovery codes left: <strong>{data.status.recoveryCodesLeft}</strong>.</p>
			
			{#each twoFactorItems as item, index (item.action)}
				{@const errors = errorsFor(item.action)}
				{@const message = messageFor(item.action)}
				{#if index > 0}<Separator />{/if}
				<form
					method="POST"
					action="?/{item.action}"
					novalidate
					class="flex flex-col gap-3"
					use:enhance={validate(secondFactorSchema, item.action)}
				>
					<h3 class="font-medium">{item.label}</h3>
					<p class="text-sm text-muted-foreground">{item.hint} Enter a code from your app, or a recovery code.</p>
					{#if message}
						<Alert.Root variant="destructive">
							<CircleAlertIcon aria-hidden="true" />
							<Alert.Description>{message}</Alert.Description>
						</Alert.Root>
					{/if}
					<FormField
						id="{item.action}-code"
						name="code"
						label="Code"
						autocomplete="one-time-code"
						spellcheck="false"
						class="font-mono"
						errors={errors.code}
					/>
					<Button type="submit" variant={item.variant} class="self-start" disabled={pending === item.action}>
						{item.label}
					</Button>
				</form>
			{/each}
		{:else if data.setup}
			{@const errors = errorsFor('confirm')}
			{@const message = messageFor('confirm')}
			<ol class="flex list-decimal flex-col gap-4 pl-5 text-sm">
				<li>
					Scan this QR code with your authenticator app (Google Authenticator, Authy, Bitwarden...).
					<img
						src={data.setup.qrCode}
						alt="QR code to scan with your authenticator app"
						width="224"
						height="224"
						class="mt-2 rounded-md border"
					/>
					<p class="mt-2">Can't scan it? Enter this key manually:</p>
					<code class="mt-1 block rounded-md bg-muted px-2 py-1 break-all">{groupedSecret}</code>
				</li>
				<li>
					<form
						method="POST"
						action="?/confirm"
						novalidate
						class="flex flex-col gap-3"
						use:enhance={validate(totpCodeSchema, 'confirm')}
					>
						{#if message}
							<Alert.Root variant="destructive">
								<CircleAlertIcon aria-hidden="true" />
								<Alert.Description>{message}</Alert.Description>
							</Alert.Root>
						{/if}
						<FormField
							id="confirm-code"
							name="code"
							label="Enter the 6-digit code shown by the app"
							inputmode="numeric"
							autocomplete="one-time-code"
							class="font-mono"
							errors={errors.code}
						/>
						<Button type="submit" class="self-start" disabled={pending === 'confirm'}>Turn on</Button>
					</form>
				</li>
			</ol>
			<form method="POST" action="?/cancel" use:enhance>
				<Button type="submit" variant="ghost" size="sm">Cancel setup</Button>
			</form>
		{:else}
			{#if messageFor('disable')}
				<Alert.Root role="status">
					<CircleCheckIcon aria-hidden="true" />
					<Alert.Description>{messageFor('disable')}</Alert.Description>
				</Alert.Root>
			{/if}
			<form method="POST" action="?/setup" use:enhance>
				<Button type="submit">Set up two-factor authentication</Button>
			</form>
		{/if}
	</Card.Content>
</Card.Root>

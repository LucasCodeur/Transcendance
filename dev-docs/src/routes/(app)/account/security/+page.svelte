<script lang="ts">
	import { enhance, type SubmitFunction } from '$app/forms';
	import { z } from 'zod';
	import { secondFactorSchema, totpCodeSchema } from '#lib/schemas/two-factor.js';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	// Client-side errors, remembered with the form they belong to (three forms have a `code` field).
	let clientErrors = $state<{ action: string; errors: Record<string, string[] | undefined> } | null>(null);

	function errorsFor(action: string): Record<string, string[] | undefined> {
		if (clientErrors?.action === action) return clientErrors.errors;
		if (form?.action === action && 'errors' in form) return form.errors ?? {};
		return {};
	}

	function messageFor(action: string): string | null {
		return form?.action === action && 'message' in form ? (form.message ?? null) : null;
	}

	// Same rule on both sides: the schema is checked here, then again by the server.
	function validate(schema: typeof totpCodeSchema | typeof secondFactorSchema, action: string): SubmitFunction {
		return ({ formData, cancel }) => {
			const parsed = schema.safeParse(Object.fromEntries(formData));
			if (!parsed.success) {
				clientErrors = { action, errors: z.flattenError(parsed.error).fieldErrors };
				cancel();
				return;
			}
			clientErrors = null;
		};
	}

	const recoveryCodes = $derived(form && 'recoveryCodes' in form ? form.recoveryCodes : null);
	// The secret, in groups of 4 to make manual typing easier.
	const groupedSecret = $derived(data.setup?.secret.match(/.{1,4}/g)?.join(' ') ?? '');
</script>

<svelte:head>
	<title>Security</title>
</svelte:head>

<h1 class="text-2xl font-bold">Security</h1>
<h2 class="mt-6 text-xl font-bold">Two-factor authentication</h2>

{#if data.notice}
	<p role="status" class="mt-4 rounded bg-amber-50 px-3 py-2 text-sm text-amber-900">{data.notice}</p>
{/if}

{#if recoveryCodes}
	<section class="mt-4 rounded border border-amber-300 bg-amber-50 p-4" aria-labelledby="recovery-title">
		<h3 id="recovery-title" class="font-bold">Your recovery codes</h3>
		<p class="mt-1 text-sm">
			Save them somewhere safe now: they will not be shown again. Each code works once, if you lose access to your app.
		</p>
		<ul class="mt-3 grid grid-cols-2 gap-1 font-mono text-sm">
			{#each recoveryCodes as code (code)}
				<li>{code}</li>
			{/each}
		</ul>
	</section>
{/if}

{#if data.status.enabled}
	<p class="mt-4">
		Two-factor authentication is <strong>on</strong>. Recovery codes left: {data.status.recoveryCodesLeft}.
	</p>

	{#each [{ action: 'regenerate', label: 'Generate new recovery codes', hint: 'Your old recovery codes will stop working.' }, { action: 'disable', label: 'Turn off two-factor authentication', hint: 'Your account will be protected by your password only.' }] as item (item.action)}
		{@const errors = errorsFor(item.action)}
		{@const message = messageFor(item.action)}
		<form method="POST" action="?/{item.action}" novalidate class="mt-6 flex flex-col gap-2" use:enhance={validate(secondFactorSchema, item.action)}>
			<h3 class="font-semibold">{item.label}</h3>
			<p class="text-sm text-gray-700">{item.hint} Enter a code from your app, or a recovery code.</p>
			{#if message}<p role="alert" class="rounded bg-red-50 px-3 py-2 text-sm text-red-800">{message}</p>{/if}
			<label for="{item.action}-code" class="text-sm font-semibold">Code</label>
			<input
				id="{item.action}-code"
				name="code"
				type="text"
				autocomplete="one-time-code"
				spellcheck="false"
				aria-invalid={errors.code ? 'true' : undefined}
				aria-describedby={errors.code ? `${item.action}-code-error` : undefined}
				class="rounded border-gray-300 font-mono aria-[invalid=true]:border-red-600"
			/>
			{#if errors.code}<p id="{item.action}-code-error" class="text-sm text-red-700">{errors.code[0]}</p>{/if}
			<button type="submit" class="self-start rounded border border-gray-300 px-3 py-1 hover:bg-gray-100">{item.label}</button>
		</form>
	{/each}
{:else if data.setup}
	{@const errors = errorsFor('confirm')}
	{@const message = messageFor('confirm')}
	<ol class="mt-4 flex list-decimal flex-col gap-4 pl-5">
		<li>
			Scan this QR code with your authenticator app (Google Authenticator, Authy, Bitwarden…).
			<img src={data.setup.qrCode} alt="QR code to scan with your authenticator app" width="224" height="224" class="mt-2 rounded border border-gray-200" />
			<p class="mt-2 text-sm">Can't scan it? Enter this key manually:</p>
			<code class="mt-1 block break-all rounded bg-gray-100 px-2 py-1 text-sm">{groupedSecret}</code>
		</li>
		<li>
			<form method="POST" action="?/confirm" novalidate class="flex flex-col gap-2" use:enhance={validate(totpCodeSchema, 'confirm')}>
				{#if message}<p role="alert" class="rounded bg-red-50 px-3 py-2 text-sm text-red-800">{message}</p>{/if}
				<label for="confirm-code">Enter the 6-digit code shown by the app</label>
				<input
					id="confirm-code"
					name="code"
					type="text"
					inputmode="numeric"
					autocomplete="one-time-code"
					aria-invalid={errors.code ? 'true' : undefined}
					aria-describedby={errors.code ? 'confirm-code-error' : undefined}
					class="rounded border-gray-300 font-mono tracking-widest aria-[invalid=true]:border-red-600"
				/>
				{#if errors.code}<p id="confirm-code-error" class="text-sm text-red-700">{errors.code[0]}</p>{/if}
				<button type="submit" class="self-start rounded bg-emerald-700 px-4 py-2 font-semibold text-white hover:bg-emerald-800">
					Turn on
				</button>
			</form>
		</li>
	</ol>
	<form method="POST" action="?/cancel" use:enhance class="mt-4">
		<button type="submit" class="text-sm text-gray-700 underline">Cancel</button>
	</form>
{:else}
	{#if messageFor('disable')}<p role="status" class="mt-4 rounded bg-emerald-50 px-3 py-2 text-sm">{messageFor('disable')}</p>{/if}
	<p class="mt-4">
		Two-factor authentication is <strong>off</strong>. Turn it on to ask for a code from your phone at each login, on
		top of your password.
	</p>
	<form method="POST" action="?/setup" use:enhance class="mt-4">
		<button type="submit" class="rounded bg-emerald-700 px-4 py-2 font-semibold text-white hover:bg-emerald-800">
			Set up two-factor authentication
		</button>
	</form>
{/if}


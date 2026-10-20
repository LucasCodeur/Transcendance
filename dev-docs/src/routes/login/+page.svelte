<script lang="ts">
	import { enhance } from '$app/forms';
	import { z } from 'zod';
	import { loginSchema } from '#lib/schemas/auth.js';
	import type { PageProps } from './$types';

	let { form }: PageProps = $props();

	let clientErrors = $state<Record<string, string[] | undefined>>({});
	let submitting = $state(false);

	const errors = $derived<Record<string, string[] | undefined>>({
		...(form?.errors ?? {}),
		...clientErrors
	});
</script>

<svelte:head>
	<title>Se connecter</title>
</svelte:head>

<h1 class="text-2xl font-bold">Se connecter</h1>

<form
	method="POST"
	novalidate
	class="mt-6 flex flex-col gap-4"
	use:enhance={({ formData, cancel }) => {
		const parsed = loginSchema.safeParse(Object.fromEntries(formData));
		if (!parsed.success) {
			clientErrors = z.flattenError(parsed.error).fieldErrors;
			cancel();
			return;
		}
		clientErrors = {};
		submitting = true;
		return async ({ update }) => {
			await update();
			submitting = false;
		};
	}}
>
	{#if form?.message}
		<!-- One message for "unknown email" and "wrong password": never say which. -->
		<p role="alert" class="rounded bg-red-50 px-3 py-2 text-sm text-red-800">{form.message}</p>
	{/if}

	<div class="flex flex-col gap-1">
		<label for="email" class="font-semibold">Adresse email</label>
		<input
			id="email"
			name="email"
			type="email"
			autocomplete="email"
			value={form?.email ?? ''}
			required
			aria-invalid={errors.email ? 'true' : undefined}
			aria-describedby={errors.email ? 'email-error' : undefined}
			class="rounded border-gray-300 aria-[invalid=true]:border-red-600"
		/>
		{#if errors.email}<p id="email-error" class="text-sm text-red-700">{errors.email[0]}</p>{/if}
	</div>

	<div class="flex flex-col gap-1">
		<label for="password" class="font-semibold">Mot de passe</label>
		<input
			id="password"
			name="password"
			type="password"
			autocomplete="current-password"
			required
			aria-invalid={errors.password ? 'true' : undefined}
			aria-describedby={errors.password ? 'password-error' : undefined}
			class="rounded border-gray-300 aria-[invalid=true]:border-red-600"
		/>
		{#if errors.password}<p id="password-error" class="text-sm text-red-700">{errors.password[0]}</p>{/if}
	</div>

	<button
		type="submit"
		disabled={submitting}
		class="mt-2 rounded bg-emerald-700 px-4 py-2 font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
	>
		{submitting ? 'Connexion…' : 'Se connecter'}
	</button>
</form>

<p class="mt-6 text-sm">
	Pas encore de compte ? <a href="/register" class="text-emerald-800 underline">Créer un compte</a>
</p>

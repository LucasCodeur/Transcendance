<script lang="ts">
	import { enhance } from '$app/forms';
	import { z } from 'zod';
	import { registerSchema } from '#lib/schemas/auth.js';
	import type { PageProps } from './$types';

	let { form }: PageProps = $props();

	// Client-side errors are comfort only: the server revalidates everything.
	let clientErrors = $state<Record<string, string[] | undefined>>({});
	let submitting = $state(false);

	const errors = $derived<Record<string, string[] | undefined>>({
		...(form?.errors ?? {}),
		...clientErrors
	});

	const fields = [
		{ name: 'displayName', label: 'Nom affiché', type: 'text', autocomplete: 'nickname' },
		{ name: 'email', label: 'Adresse email', type: 'email', autocomplete: 'email' },
		{ name: 'password', label: 'Mot de passe (12 caractères minimum)', type: 'password', autocomplete: 'new-password' },
		{ name: 'passwordConfirm', label: 'Confirmer le mot de passe', type: 'password', autocomplete: 'new-password' }
	] as const;

	function initialValue(name: string): string {
		if (name === 'email') return form?.email ?? '';
		if (name === 'displayName') return form?.displayName ?? '';
		return ''; // never refill a password
	}
</script>

<svelte:head>
	<title>Créer un compte</title>
</svelte:head>

<h1 class="text-2xl font-bold">Créer un compte</h1>

<form
	method="POST"
	novalidate
	class="mt-6 flex flex-col gap-4"
	use:enhance={({ formData, cancel }) => {
		const parsed = registerSchema.safeParse(Object.fromEntries(formData));
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
	{#each fields as field (field.name)}
		<div class="flex flex-col gap-1">
			<label for={field.name} class="font-semibold">{field.label}</label>
			<input
				id={field.name}
				name={field.name}
				type={field.type}
				autocomplete={field.autocomplete}
				value={initialValue(field.name)}
				required
				aria-invalid={errors[field.name] ? 'true' : undefined}
				aria-describedby={errors[field.name] ? `${field.name}-error` : undefined}
				class="rounded border-gray-300 aria-[invalid=true]:border-red-600"
			/>
			{#if errors[field.name]}
				<p id="{field.name}-error" class="text-sm text-red-700">{errors[field.name]?.[0]}</p>
			{/if}
		</div>
	{/each}

	<button
		type="submit"
		disabled={submitting}
		class="mt-2 rounded bg-emerald-700 px-4 py-2 font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
	>
		{submitting ? 'Création…' : 'Créer mon compte'}
	</button>
</form>

<p class="mt-6 text-sm">
	Déjà un compte ? <a href="/login" class="text-emerald-800 underline">Se connecter</a>
</p>

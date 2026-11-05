<script lang='ts'>
	import { enhance } from "$app/forms";
	import { z } from "zod";
	import { secondFactorSchema } from "#lib/schemas/two-factor.ts";
	import type { PageProps } from "./$types";

	let { form }: PageProps = $props();

	let clientErrors = $state<Record<string, string[] | undefined>>({});
	let submitting = $state(false);

	const errors = $derived<Record<string, string[] | undefined>>({
		...(form?.errors ?? {}),
		...clientErrors
	});
</script>

<svelte:head><title>Two-factor authentification</title></svelte:head>
<h1>Two-factor authentification</h1>
<p>Open your authenticator app and enter the 6-digit code. Lost your phone ? Enter one of your recovery codes.</p>
<form method="POST"
	novalidate 
	use:enhance={({ formData, cancel }) => {
		const parsed = secondFactorSchema.safeParse(Object.fromEntries(formData));
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
		<p role="alert" class="rounded bg-red-50 px-3 py-2 text-sm text-red-800">{form.message}</p>
	{/if}

	<div class="flex flex-col gap-1">
		<label for="code" class="font-semibold">Code</label>
		<input
			id="code"
			name="code"
			type="text"
			autocomplete="one-time-code"
			spellcheck="false"
			required
			aria-invalid={errors.code ? 'true' : undefined}
			aria-describedby={errors.code ? 'code-error' : undefined}
			class="rounded border-gray-300 font-mono tracking-widest aria-[invalid=true]:border-red-600"
		/>
		{#if errors.code}<p id="code-error" class="text-sm text-red-700">{errors.code[0]}</p>{/if}
	</div>

	<button
		type="submit"
		disabled={submitting}
		class="rounded bg-emerald-700 px-4 py-2 font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
	>
		{submitting ? 'Checking…' : 'Verify'}
	</button>
</form>

<form method="POST" action="/logout" class="mt-4">
	<button type="submit" class="text-sm text-gray-700 underline">Cancel and log out</button>
</form>

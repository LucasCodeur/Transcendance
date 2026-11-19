<script lang="ts">
	import { enhance } from '$app/forms';
	import { z } from 'zod';
	import { registerSchema } from '#lib/schemas/auth.js';
	import AuthCard from '#lib/components/AuthCard.svelte';
	import FormField from '#lib/components/FormField.svelte';
	import { Button } from '#lib/components/ui/button/index.ts';
	import type { PageProps } from './$types';

	let { form }: PageProps = $props();

	let clientErrors = $state<Record<string, string[] | undefined>>({});
	let submitting = $state(false);

	const errors = $derived<Record<string, string[] | undefined>>({
		...(form?.errors ?? {}),
		...clientErrors
	});

	const fields = [
		{ name: 'displayName', label: 'Display name', type: 'text', autocomplete: 'nickname' },
		{ name: 'email', label: 'Email', type: 'email', autocomplete: 'email' },
		{ name: 'password', label: 'Password', type: 'password', autocomplete: 'new-password', hint: 'At least 12 characters.' },
		{ name: 'passwordConfirm', label: 'Confirm password', type: 'password', autocomplete: 'new-password' }
	] as const;

	function initialValue(name: string): string {
		if (name === 'email') return form?.email ?? '';
		if (name === 'displayName') return form?.displayName ?? '';
		return '';
	}
</script>

<svelte:head>
	<title>Sign up</title>
</svelte:head>

<AuthCard title="Create an account" description="Build and share your family tree.">
	<form
		method="POST"
		novalidate
		class="flex flex-col gap-4"
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
				await update()
				submitting = false;
			};
		}}
	>
		{#each fields as field (field.name)}
			<FormField
				id={field.name}
				name={field.name}
				type={field.type}
				label={field.label}
				autocomplete={field.autocomplete}
				hint={'hint' in field ? field.hint : undefined}
				value={initialValue(field.name)}
				errors={errors[field.name]}
			/>
		{/each}

		<Button type="submit" class="w-full" disabled={submitting}>
			{submitting ? 'Creating account...' : 'Create account'}
		</Button>
	</form>
	{#snippet footer()}
		<p>Already have an account? <a href="/login" class="font-medium text-foreground underline underline-offset-4">Log in</a></p>
	{/snippet}
</AuthCard>

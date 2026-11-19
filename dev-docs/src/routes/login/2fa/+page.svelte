<script lang='ts'>
	import { enhance } from "$app/forms";
	import { z } from "zod";
	import CircleAlertIcon from '@lucide/svelte/icons/circle-alert';
	import { secondFactorSchema } from "#lib/schemas/two-factor.ts";
	import AuthCard from '#lib/components/AuthCard.svelte';
	import FormField from '#lib/components/FormField.svelte';
	import * as Alert from '#lib/components/ui/alert/index.ts';
	import { Button } from '#lib/components/ui/button/index.ts';
	import type { PageProps } from "./$types";

	let { form }: PageProps = $props();

	let clientErrors = $state<Record<string, string[] | undefined>>({});
	let submitting = $state(false);

	const errors = $derived<Record<string, string[] | undefined>>({
		...(form?.errors ?? {}),
		...clientErrors
	});
</script>

<svelte:head>
	<title>Two-factor authentication</title>
</svelte:head>

<AuthCard
	title="Two-factor authentication"
	description="Open your authenticator app and enter the 6-digit code. Lost your phone? Enter one of your recovery codes."
>
	<form
		method="POST"
		novalidate
		class="flex flex-col gap-4"
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
		{#if form?.error}
			<Alert.Root variant="destructive">
				<CircleAlertIcon aria-hidden="true" />
				<Alert.Description>{form.error}</Alert.Description>
			</Alert.Root>
		{/if}

		<FormField
			id="code"
			name="code"
			label="code"
			autocomplete="one-time-code"
			spellcheck="false"
			errors={errors.code}
		/>

		<Button type="submit" class="w-full" disabled={submitting}>
			{submitting ? 'Checking...' : 'Verify'}
		</Button>
		{#snippet footer()}
			<form method="POST" action="/logout">
				<Button type="submit" variant="link" size="sm">Cancel and log out</Button>
			</form>
		{/snippet}
	</form>
</AuthCard>

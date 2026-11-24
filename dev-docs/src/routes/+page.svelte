<script lang="ts">
import { Button } from '#lib/components/ui/button/index.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Genealogy</title>
</svelte:head>

<section class="mx-auto flex max-w-2xl flex-col items-center gap-6 py-10 text-center">
	<h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">Build your family tree, together.</h1>
	<p class="text=muted-foreground">
		Record your ancestors, invite your relatives and discover where your branches  meet.
	</p>
	{#if data.user}
		<p>Welcome back, <span class="font-medium">{data.user.displayName}</span>.</p>
		<Button href="/account">Go to your account</Button>
	{:else}
		<div class="flex flex-wrap justify-center gap-2">
			<Button href="/register">Get started</Button>
			<Button href="/login" variant="outline">Log in</Button>
		</div>
	{/if}
</section>

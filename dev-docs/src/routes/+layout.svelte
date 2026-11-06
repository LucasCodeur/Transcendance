<script lang="ts">
	import './layout.css';
	import favicon from '#lib/assets/favicon.svg';
	import { enhance } from '$app/forms';
	import type { LayoutProps } from './$types';

	let { children, data }: LayoutProps = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<header class="flex items-center justify-between border-b border-gray-200 px-6 py-4">
	<a href="/" class="text-lg font-bold">Généalogie</a>

	<nav class="flex items-center gap-4">
		{#if data.user}
			<a href="/account" class="hover:underline">{data.user.displayName}</a>
			<!-- POST, not a link: a GET /logout could be triggered by another site. -->
			<form method="POST" action="/logout" use:enhance>
				<button type="submit" class="rounded border border-gray-300 px-3 py-1 hover:bg-gray-100">
					logout
				</button>
			</form>
		{:else}
			<a href="/login" class="hover:underline">Se connecter</a>
			<a href="/register" class="rounded bg-emerald-700 px-3 py-1 text-white hover:bg-emerald-800">
				Créer un compte
			</a>
		{/if}
	</nav>
</header>

<main class="mx-auto max-w-md px-4 py-10">
	{@render children()}
</main>

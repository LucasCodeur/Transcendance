<script lang="ts">
	import './layout.css';
	import favicon from '#lib/assets/favicon.svg';
	import TreeDeciduousIcon from '@lucide/svelte/icons/tree-deciduous';
	import { ModeWatcher } from 'mode-watcher';
	import UserMenu from '#lib/components/UserMenu.svelte';
	import ThemeToggle from '#lib/components/ThemeToggle.svelte';
	import { Button } from '#lib/components/ui/button/index.ts';
	import type { LayoutProps } from './$types';

	let { children, data }: LayoutProps = $props();
</script>

<ModeWatcher />

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<!-- keyboard user -->
<a
	href="#main"
	class="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:ring-3 focus:ring-ring/50"
>
	Skip to main content
</a>
<div class="flex min-h-svh flex-col">
	<header class="sticky top-0 z-40 border-b bg-background">
		<div class="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-4 px-4">
			<a 
				href="/"
				class="flex items-center gap-2 rounded-md font-semibold outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
			>
				<TreeDeciduousIcon class="size-5" aria-hidden="true" />
				Genealogy
			</a>
			<div class="flex items-center gap-2">
				{#if data.user}
					<UserMenu user={data.user} />
					<Button href="/organizations" size="sm">Organizations</Button>
					<Button href="/friends" size="sm">Friends</Button>
				{:else}
					<nav aria-label="Authentication" class="flex items-center gap-2">
						<Button href="/login" variant="ghost" size="sm">Log in</Button>
						<Button href="/register" size="sm">Sign up</Button>
						<Button href="/organizations" size="sm">Organizations</Button>
						<Button href="/friends" size="sm">Friends</Button>
					</nav>
				{/if}
				<ThemeToggle />
			</div>
		</div>
	</header>

	<main id="main" tabindex="-1" class="mx-auto w-full max-w-5xl flex-1 px-4 py-10 outline-none">
		{@render children()}
	</main>
</div>

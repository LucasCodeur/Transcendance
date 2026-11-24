<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '#lib/components/ui/button/index.ts';
	import type { LayoutProps } from './$types';
	
	let { children }: LayoutProps = $props();

	const tabs = [
		{ href: '/account', label: 'Profile' },
		{ href: '/account/security', label: 'Security' }
	] as const;
</script>

<div class="mx-auto flex w-full max-w-2xl flex-col gap-6">
	<div>
		<h1 class="text-2xl font-semibold tracking-tight">Account settings</h1>
		<p class="text-sm text-muted-foreground">Manage your profile and the way you sign in.</p>
	</div>

	<nav aria-label="Account sections" class="flex gap-1 border-b pb-2">
		{#each tabs as tab (tab.href)}
			{@const current = page.url.pathname === tab.href}
			<Button
				href={tab.href}
				variant={current ? 'secondary' : 'ghost'}
				size="sm"
				aria-current={current ? 'page' : undefined}
			>
				{tab.label}
			</Button>
		{/each}
	</nav>
	
	{@render children()}
</div>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import * as Card from '#lib/components/ui/card/index.ts';

	type Props = {
		title: string;
		description: string;
		children: Snippet;
		footer?: Snippet;
	};

	let { title, description, children, footer }: Props = $props();
</script>

<div class="mx-auto w-full max-w-sm">
	<Card.Root>
		<Card.Header>
			<Card.Title><h1 class="text-xl font-semibold">{title}</h1></Card.Title>
			<Card.Description>{description}</Card.Description>
		</Card.Header>
		<Card.Content class="flex flex-col gap-6">
			{@render children()}
		</Card.Content>
		{#if footer}
			<Card.Footer class="justify-center text-sm text-muted-foreground">
				{@render  footer()}
			</Card.Footer>
		{/if}
	</Card.Root>
</div>

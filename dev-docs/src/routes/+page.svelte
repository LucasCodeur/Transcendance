<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

{#if data.user}
	<p>You are logged in as {data.user.displayName}</p>
{:else}
	<p>You are disconnected</p>
{/if}

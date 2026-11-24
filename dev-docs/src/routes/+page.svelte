<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

{#if data.user}
	<p>You are logged in as {data.user.displayName}</p>
	<a href="http://10.12.11.6:5501/test.html">coucou</a>
{:else}
	<p>You are disconnected</p>
{/if}

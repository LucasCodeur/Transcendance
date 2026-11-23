<script lang="ts">
	let { sent } = $props();
</script>

<!-- all about sent friend request -->
<div class="mb-5 rounded-sm p-2  border border-black">
	<p class="font-bold text-4xl">Friend request(s) sent:</p>
	{#if sent.length === 0}
		<p class="mt-4 ml-4">You have not sent any friend request not accepted yet !</p>
	{/if}
	{#each sent as sent}
		<p class="mt-4 ml-4">{sent} (waiting to be accept)</p>
	{/each}
</div>

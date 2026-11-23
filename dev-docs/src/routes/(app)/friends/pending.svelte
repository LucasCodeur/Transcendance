<script lang="ts">
	import { Button } from "#lib/components/ui/button/index.ts";

	let { pending } = $props();
</script>

<!-- all about pending friend request -->
<div class="mb-5 rounded-sm p-2  border border-black">
	<p class="font-bold text-4xl">Pending Friend request(s):</p>
	{#if pending.length === 0}
		<p class="mt-4 ml-4">No request pending...</p>
	{/if}
	{#each pending as pending}
		<div class="m-5 flex justify-around">
				<p class="font-semibold mt-auto mb-auto text-center">{pending} sent you a friend request:</p>

				<form method="POST" action="?/accept_deny">
					<input class="hidden" name="type" value="accept" />
					<Button type="submit" name="friend" value={pending} class="text-green-500" variant="outline">accept</Button>
				</form>

				<form method="POST" action="?/accept_deny">
					<input class="hidden" name="type" value="deny" />
					<Button type="submit" name="friend" value={pending} class="text-red-500 " variant="outline">deny</Button>
				</form>
		</div>
	{/each}
</div>

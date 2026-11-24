<script lang="ts">
	let { sent, socket } = $props();

	let sent_state = $state(sent);

	socket.on("send_friend_request_success", async(successData) => {
		// only push if newFriend no in list)
		if (sent_state.includes(successData.newFriend) === false) {
			sent_state.push(successData.newFriend);
		}
	})
</script>

<!-- all about sent_state friend request -->
<div class="mb-5 rounded-sm p-2  border border-black">
	<p class="font-bold text-4xl">Friend request(s) sent:</p>
	{#if sent_state.length === 0}
		<p class="mt-4 ml-4">You have not sent any friend request not accepted yet !</p>
	{/if}
	{#each sent_state as sent_i}
		<p class="mt-4 ml-4">{sent_i} (waiting to be accept)</p>
	{/each}
</div>

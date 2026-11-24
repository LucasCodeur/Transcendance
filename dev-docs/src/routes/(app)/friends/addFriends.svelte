<script lang="ts">
	import { enhance } from '$app/forms';
	import { z } from 'zod';
	import { friendRequestScheme } from '#lib/schemas/friend.ts' 

	let webSocketErrors = $state({});
	let clientErrors = $state<Record<string, string[] | undefined>>({});
	let errors = $derived<Record<string, string[] | undefined>>({
		...(form?.errors ?? {}),
		...clientErrors,
		...webSocketErrors,
	});

	let webSocketSuccess = $state({});

	let success = $derived({
		...(form?.success ?? {}),
		...webSocketSuccess
	});


	let { form, socket } = $props();
	socket.on("send_friend_request_error", async(errorData) => {
		webSocketSuccess = {};
		webSocketErrors = errorData;
	})

	socket.on("send_friend_request_success", async(successData) => {
		webSocketErrors = {};
		webSocketSuccess = successData;
	})
</script>

<!-- all about adding new friend -->
<div class="mb-5 rounded-sm p-2  border border-black">
	<p class=" font-bold text-4xl">Add Friend:</p>
	<form
		action="?/create"
		method="POST"
		use:enhance={({ formData, cancel }) => {
			const parsed = friendRequestScheme.safeParse(Object.fromEntries(formData));
			if (!parsed.success) {
				clientErrors = z.flattenError(parsed.error).fieldErrors;
				cancel();
			}
			socket.emit("send_friend_request", parsed.data);
			cancel();
			return ;
		}}
	>
		<div class="border border-black rounded-sm m-4">
		<input  class="rounded-sm m-4" id="friendName" name="friendName" placeholder="Enter a friend name" type="text" />
		<button class="border border-black p-2 rounded-lg">send request</button>
		{#if errors.friendName}
			<p class="text-red-600 m-3">Error: {errors.friendName}</p>
		{/if}
		{#if success.friendName}
			<p class="text-green-600 m-3">Success: {success.friendName}</p>
		{/if}
		</div>	
	</form>
</div>


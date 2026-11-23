<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from "#lib/components/ui/button/index.ts";
	import Friends from "./friend.svelte"

	import { z } from 'zod';
	import { io } from 'socket.io-client';
	import type { PageProps } from './$types';
	import { friendRequestScheme } from '#lib/schemas/friend.ts' 

	interface Friend {
		pending: string[],
		friends: string[],
		sent: string[],
	}

	let { data, form }: PageProps = $props();
	let clientErrors = $state<Record<string, string[] | undefined>>({});
	let errors = $derived<Record<string, string[] | undefined>>({
		...(form?.errors ?? {}),
		...clientErrors,
	});


	const	socket = io();


	interface Messages {
		sender: string;
		receiver: string;
		date: string;
	}

</script>


<!-- all about incoming friend request -->
<div class="mb-5 rounded-sm p-2  border border-black">
	<p class="font-bold text-4xl">Pending Friend request(s):</p>
	{#if data.pending.length === 0}
		<p class="mt-4 ml-4">No request pending...</p>
	{/if}
	{#each data.pending as pending}
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

<Friends me={data.me} url={data.url} socket={socket} friends={data.friends} />
<!-- all about friend and chat -->
<!-- <div class="mb-5 rounded-sm p-2  border border-black"> -->
<!-- 	<p class="font-bold text-4xl">Friend(s):</p> -->
<!-- 	{#if data.friends.length === 0} -->
<!-- 		<p class="mt-4 ml-4">You currently have no friend, consider adding some !</p> -->
<!-- 	{/if} -->
<!-- 	<ul> -->
<!-- 	{#each data.friends as friend} -->
<!-- 			<li class="m-2"> -->
<!-- 				<Button  -->
<!-- 					class="w-80/100"  -->
<!-- 					variant="outline" -->
<!-- 					onclick={async () => { -->
<!-- 						// here we should set some variables -->
<!-- 						// which would open a chatbox and a chat with the users ! -->
<!---->
<!-- 						// retrieve messages -->
<!-- 						// use fetch to call friends/getMessages api -->
<!-- 						const options  = { -->
<!-- 									method:"POST", -->
<!-- 									credentials: "same-origin", -->
<!-- 									headers: { -->
<!-- 										"Content-type": "application/json", -->
<!-- 									}, -->
<!-- 									body: JSON.stringify({from:data.me, to:friend}), -->
<!-- 								}; -->
<!-- 						const messages_response = await fetch(data.url + "/getMessages", options); -->
<!-- 						messages_data = await messages_response.json(); -->
<!---->
<!-- 						console.log("messages_data:"); -->
<!-- 						console.log(messages_data); -->
<!-- 						split_messages(messages_data); -->
<!---->
<!-- 						show_chat(friend); -->
<!-- 						if (chat !== null) { -->
<!-- 							chat.scrollTo(0, chat.scrollHeight); -->
<!-- 						} -->
<!-- 						socket.on(friendChat, (data) => { -->
<!-- 							console.log(`received a message from ${friendChat}`); -->
<!-- 						}); -->
<!-- 						// connect to websocket  -->
<!---->
<!-- 					}} -->
<!-- 				> -->
<!-- 					{friend} -->
<!-- 				</Button> -->
<!-- 			</li> -->
<!-- 	{/each} -->
<!-- 	</ul> -->
<!-- </div> -->
<!---->
<!-- <div   -->
<!-- 	class="p-4 rounded-xl inset-shadow-sm/50 bg-sky-100 {hidden} fixed right-3 bottom-3 size-60/100 max-w-150  border border-red-600" -->
<!-- > -->
<!-- 	<div class="flex flex-col justify-between gap-2 h-full"> -->
<!---->
<!-- 		<div class="rounded-xl flex p-4 justify-between border border-black"> -->
<!-- 			<p class="mt-auto mb-auto font-semibold">messages with {friendChat}</p> -->
<!-- 			<div class=""> -->
<!-- 				<Button onclick={(e) => -->
<!-- 					{ -->
<!-- 						toggle_chat_hidden(); -->
<!-- 					} -->
<!-- 				}>x</Button> -->
<!-- 			</div> -->
<!-- 		</div> -->
<!---->
<!-- 		<div bind:this={chat} class="h-70/100 p-2 rounded-xl border border-black overflow-auto"> -->
<!-- 			<div class="  flex w-full  flex-col gap-6 py-12"> -->
<!-- 				{#each splitted_messages as messages_block} -->
<!-- 					{#if messages_block[0].sender === data.me} -->
<!-- 						{align_to_end()} -->
<!-- 					{:else} -->
<!-- 						{align_to_empty()} -->
<!-- 					{/if} -->
<!-- 					<Message.Root align={align}> -->
<!-- 					<Message.Avatar> -->
<!-- 						<Avatar.Root> -->
<!-- 							<Avatar.Fallback>{messages_block[0].sender[0].toUpperCase()}</Avatar.Fallback> -->
<!-- 						</Avatar.Root> -->
<!-- 					</Message.Avatar> -->
<!-- 					<Message.Content> -->
<!-- 					{#each messages_block as message} -->
<!-- 						<Bubble.Root variant="muted"> -->
<!-- 							<Bubble.Content>{message.content}</Bubble.Content> -->
<!-- 						</Bubble.Root> -->
<!-- 					{/each} -->
<!---->
<!-- 					</Message.Content> -->
<!-- 					</Message.Root> -->
<!-- 				{/each} -->
<!-- 			</div> -->
<!-- 		</div> -->
<!---->
<!-- 		<div class="flex justify-between"> -->
<!-- 			<input bind:value={chat_content} class="rounded-xl w-80/100 bg-taupe-50" type="text"> -->
<!-- 			<Button   -->
<!-- 				onclick={() => { -->
<!-- 						socket.emit("send_message", {to:friendChat, content:chat_content}); -->
<!-- 					} -->
<!-- 				} -->
<!-- 				variant="outline"  -->
<!-- 				type="submit"> -->
<!-- 				send -->
<!-- 			</Button> -->
<!-- 		</div> -->
<!---->
<!-- 	</div> -->
<!---->
<!-- </div> -->



<!-- all about sent friend request -->
<div class="mb-5 rounded-sm p-2  border border-black">
	<p class="font-bold text-4xl">Friend request(s) sent:</p>
	{#if data.sent.length === 0}
		<p class="mt-4 ml-4">You have not sent any friend request not accepted yet !</p>
	{/if}
	{#each data.sent as sent}
		<p class="mt-4 ml-4">{sent} (waiting to be accept)</p>
	{/each}
</div>

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
			return ;
		}}
	>
		<div class="border border-black rounded-sm m-4">
		<input  class="rounded-sm m-4" id="friendName" name="friendName" placeholder="Enter a friend name" type="text" />
		<button class="border border-black p-2 rounded-lg">send request</button>
		{#if errors.friendName}
			<p class="text-red-600 m-3">Error: {errors.friendName}</p>
		{/if}
		{#if form?.successMessage}
			<p class="text-green-600 m-3">Success: {form.successMessage}</p>
		{/if}
		</div>	
	</form>

</div>


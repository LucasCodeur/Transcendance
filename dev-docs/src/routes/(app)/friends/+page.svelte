<script lang="ts">
	import * as Avatar from "#lib/components/ui/avatar/index.ts";
	import * as Bubble from "#lib/components/ui/bubble/index.ts";
 	import * as Message from "#lib/components/ui/message/index.ts";
	import { enhance } from '$app/forms';
	import { Button } from "#lib/components/ui/button/index.ts";
	import { z } from 'zod';
	import { io } from 'socket.io-client';
	import type { PageProps } from './$types';

	interface Friend {
		pending: string[],
		friends: string[],
		sent: string[],
	}

	import { friendRequestScheme } from '#lib/schemas/friend.ts' 
	let { data, form }: PageProps = $props();
	let clientErrors = $state<Record<string, string[] | undefined>>({});
	let errors = $derived<Record<string, string[] | undefined>>({
		...(form?.errors ?? {}),
		...clientErrors,
	});

	function toggle_chat_hidden() {
		if (hidden === "hidden")
			hidden = "";
		else
			hidden = "hidden";
	}

	function hide_chat(name:string) {
		friendChat="";
		hidden="hidden";
	}

	function show_chat(name:string) {
		friendChat = name;
		hidden="";
	}

	let hidden=$state("hidden");
	let friendChat=$state("");
	let chat: HTMLElement | null;
	let chat_content: null | string = $state();

	$effect( () => {
		if (chat !== null)
			chat.scrollTo(0, chat.scrollHeight);
	});

	const	socket = io();


	interface Messages {
		sender: string;
		receiver: string;
		date: string;
	}

	let		messages_data: null | Messages[] = $state([]);
	// so a routes, where we can get all messages between two users !
	let		splitted_messages: null | Messages[][] = $state([]);
	let		align:string = "";

	function split_messages(messages_data) {

		if (messages_data.length === 0)
			return ;
		splitted_messages = [];
		let tmp_messages_block = [];
		tmp_messages_block.push(messages_data[0]);
		let last_sender = messages_data[0].sender;
		for (let i = 1; i < messages_data.length; i++) {
			console.log(`messages_data[${i}]`);
			if (messages_data[i].sender === last_sender) {
				tmp_messages_block.push(messages_data[i]);
			}
			else {
				splitted_messages.push(tmp_messages_block);
				tmp_messages_block = [messages_data[i]];
				last_sender = messages_data[i].sender;
			}
		}
		if (tmp_messages_block.length > 0)
			splitted_messages.push(tmp_messages_block);
		console.log("splitted_messages:");
		console.log(splitted_messages);
	}

	socket.on("new_message", (data) => {
		console.log("received a new message, data:");
		console.log(data);
		if (data.sender === friendChat || data.receiver === friendChat) {
			messages_data.push(data);
			console.log("messages_date:");
			split_messages(messages_data);
		}
	});

	function align_to_empty() {
		align = "";
	}
	function align_to_end(){
		align = "end";
	}
</script>


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

<div class="mb-5 rounded-sm p-2  border border-black">
	<p class="font-bold text-4xl">Friend(s):</p>
	{#if data.friends.length === 0}
		<p class="mt-4 ml-4">You currently have no friend, consider adding some !</p>
	{/if}
	<ul>
	{#each data.friends as friend}
			<li class="m-2">
				<Button 
					class="w-80/100" 
					variant="outline"
					onclick={async () => {
						// here we should set some variables
						// which would open a chatbox and a chat with the users !

						// retrieve messages
						// use fetch to call friends/getMessages api
						const options  = {
									method:"POST",
									credentials: "same-origin",
									headers: {
										"Content-type": "application/json",
									},
									body: JSON.stringify({from:data.me, to:friend}),
								};
						const messages_response = await fetch(data.url + "/getMessages", options);
						messages_data = await messages_response.json();

						console.log("messages_data:");
						console.log(messages_data);
						split_messages(messages_data);

						console.log("should sent event to the ws server");
						socket.emit("loadConversation", {user:data.me, friend:friend});
						console.log(`data.me = ${data.me}`);
						show_chat(friend);
						if (chat !== null) {
							chat.scrollTo(0, chat.scrollHeight);
						}
						socket.on(friendChat, (data) => {
							console.log(`received a message from ${friendChat}`);
						});
						// connect to websocket 
						
					}}
				>
					{friend}
				</Button>
			</li>
	{/each}
	</ul>
</div>

<div class="mb-5 rounded-sm p-2  border border-black">
	<p class="font-bold text-4xl">Friend request(s) sent:</p>
	{#if data.sent.length === 0}
		<p class="mt-4 ml-4">You have not sent any friend request not accepted yet !</p>
	{/if}
	{#each data.sent as sent}
		<p class="mt-4 ml-4">{sent} (waiting to be accept)</p>
	{/each}
</div>

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

<div  
	class="p-4 rounded-xl inset-shadow-sm/50 bg-sky-100 {hidden} fixed right-3 bottom-3 size-60/100 max-w-150  border border-red-600"
>
	<div class="flex flex-col justify-between gap-2 h-full">

		<div class="rounded-xl flex p-4 justify-between border border-black">
			<p class="mt-auto mb-auto font-semibold">messages with {friendChat}</p>
			<div class="">
				<Button onclick={(e) =>
					{
						toggle_chat_hidden();
					}
				}>x</Button>
			</div>
		</div>
		<!--

		so, an array of messages,
		each messages of form:
		{
			sender,
			receiver,
			date,
		}

		<Message.Root align="end">
			<Message.Avatar>
				<Avatar.Root>
					<Avatar.Image src="/avatars/10.png" alt="@me" />
					<Avatar.Fallback>ME</Avatar.Fallback>
				</Avatar.Root>
			</Message.Avatar>
			<Message.Content>
				<Bubble.Root>
					<Bubble.Content>Deploying to prod real quick.</Bubble.Content>
				</Bubble.Root>
			</Message.Content>
		</Message.Root>

		<Message.Root align="end">
		{#each messages as message}
		if message.sender !== current {
			</Message.Root>
			<Message.Root align="end">
				<Message.Avatar>
					<Avatar.Root>
						<Avatar.Image src="/avatars/10.png" alt="@me" />
						<Avatar.Fallback>ME</Avatar.Fallback>
					</Avatar.Root>
				</Message.Avatar>
		}
		else {
		}
			
		{/each}

		-->
	

		<div bind:this={chat} class="h-70/100 p-2 rounded-xl border border-black overflow-auto">
			<div class="  flex w-full  flex-col gap-6 py-12">
				{#each splitted_messages as messages_block}
					{#if messages_block[0].sender === data.me}
						{align_to_end()}
					{:else}
						{align_to_empty()}
					{/if}
					<Message.Root align={align}>
					<Message.Avatar>
						<Avatar.Root>
							<!-- <Avatar.Image src="/avatars/10.png" alt="@me" /> -->
							<Avatar.Fallback>{messages_block[0].sender[0].toUpperCase()}</Avatar.Fallback>
						</Avatar.Root>
					</Message.Avatar>
					<Message.Content>
					{#each messages_block as message}
						<Bubble.Root variant="muted">
							<Bubble.Content>{message.content}</Bubble.Content>
						</Bubble.Root>
					{/each}

					</Message.Content>
					</Message.Root>
				{/each}

				<!-- <Message.Root align="end"> -->
				<!-- 	<Message.Avatar> -->
				<!-- 		<Avatar.Root> -->
				<!-- 			<Avatar.Image src="/avatars/10.png" alt="@me" /> -->
				<!-- 			<Avatar.Fallback>ME</Avatar.Fallback> -->
				<!-- 		</Avatar.Root> -->
				<!-- 	</Message.Avatar> -->
				<!-- 	<Message.Content> -->
				<!-- 		<Bubble.Root> -->
				<!-- 			<Bubble.Content>Deploying to prod real quick.</Bubble.Content> -->
				<!-- 		</Bubble.Root> -->
				<!-- 	</Message.Content> -->
				<!-- </Message.Root> -->

				<!-- <Message.Root> -->
				<!-- 	<Message.Avatar> -->
				<!-- 		<Avatar.Root> -->
				<!-- 			<Avatar.Image src="/avatars/02.png" alt="@rabbit" /> -->
				<!-- 			<Avatar.Fallback>R</Avatar.Fallback> -->
				<!-- 		</Avatar.Root> -->
				<!-- 	</Message.Avatar> -->
				<!-- 	<Message.Content> -->
				<!-- 		<Bubble.Root variant="muted"> -->
				<!-- 			<Bubble.Content>It's 4:55 PM. On a Friday.</Bubble.Content> -->
				<!-- 		</Bubble.Root> -->
				<!-- 	</Message.Content> -->
				<!-- </Message.Root> -->
				<!-- <Message.Root align="end"> -->
				<!-- 	<Message.Avatar> -->
				<!-- 		<Avatar.Root> -->
				<!-- 			<Avatar.Image src="/avatars/10.png" alt="@me" /> -->
				<!-- 			<Avatar.Fallback>ME</Avatar.Fallback> -->
				<!-- 		</Avatar.Root> -->
				<!-- 	</Message.Avatar> -->
				<!-- 	<Message.Content> -->
				<!-- 		<Bubble.Root> -->
				<!-- 			<Bubble.Content>It's a one-line change.</Bubble.Content> -->
				<!-- 		</Bubble.Root> -->
				<!-- 		<Message.Footer>Delivered</Message.Footer> -->
				<!-- 	</Message.Content> -->
				<!-- </Message.Root> -->
				<!-- <Message.Root> -->
				<!-- 	<Message.Avatar> -->
				<!-- 		<Avatar.Root> -->
				<!-- 			<Avatar.Image src="/avatars/02.png" alt="@rabbit" /> -->
				<!-- 			<Avatar.Fallback>R</Avatar.Fallback> -->
				<!-- 		</Avatar.Root> -->
				<!-- 	</Message.Avatar> -->
				<!-- 	<Message.Content> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>It's always a one-line change 😭.</Bubble.Content> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 			<Bubble.Root variant="muted"> -->
				<!-- 				<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
				<!-- 				<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
				<!-- 					<span>👍</span> -->
				<!-- 				</Bubble.Reactions> -->
				<!-- 			</Bubble.Root> -->
				<!-- 	</Message.Content> -->
				<!-- </Message.Root> -->
			</div>
		</div>

		<div class="flex justify-between">
			<input bind:value={chat_content} class="rounded-xl w-80/100 bg-taupe-50" type="text">
			<Button  
				onclick={() => {socket.emit("send_message", {to:friendChat, content:chat_content});}
				}
				variant="outline" 
				type="submit">
				send
			</Button>
		</div>

	</div>

</div>

<!-- <Message.Root> -->
<!--  <Message.Avatar> -->
<!--   <Avatar.Root> -->
<!--    <Avatar.Image src="https://github.com/shadcn.png" alt="@shadcn" /> -->
<!--    <Avatar.Fallback>CN</Avatar.Fallback> -->
<!--   </Avatar.Root> -->
<!--  </Message.Avatar> -->
<!--  <Message.Content> -->
<!--   <Bubble.Root> -->
<!--    <Bubble.Content>How can I help you today?</Bubble.Content> -->
<!--   </Bubble.Root> -->
<!--  </Message.Content> -->
<!-- </Message.Root> -->

<!-- <div class="flex w-full max-w-sm flex-col gap-6 py-12"> -->
<!-- 	<Message.Root align="end"> -->
<!-- 		<Message.Avatar> -->
<!-- 			<Avatar.Root> -->
<!-- 				<Avatar.Image src="/avatars/10.png" alt="@me" /> -->
<!-- 				<Avatar.Fallback>ME</Avatar.Fallback> -->
<!-- 			</Avatar.Root> -->
<!-- 		</Message.Avatar> -->
<!-- 		<Message.Content> -->
<!-- 			<Bubble.Root> -->
<!-- 				<Bubble.Content>Deploying to prod real quick.</Bubble.Content> -->
<!-- 			</Bubble.Root> -->
<!-- 		</Message.Content> -->
<!-- 	</Message.Root> -->
<!-- 	<Message.Root> -->
<!-- 		<Message.Avatar> -->
<!-- 			<Avatar.Root> -->
<!-- 				<Avatar.Image src="/avatars/02.png" alt="@rabbit" /> -->
<!-- 				<Avatar.Fallback>R</Avatar.Fallback> -->
<!-- 			</Avatar.Root> -->
<!-- 		</Message.Avatar> -->
<!-- 		<Message.Content> -->
<!-- 			<Bubble.Root variant="muted"> -->
<!-- 				<Bubble.Content>It's 4:55 PM. On a Friday.</Bubble.Content> -->
<!-- 			</Bubble.Root> -->
<!-- 		</Message.Content> -->
<!-- 	</Message.Root> -->
<!-- 	<Message.Root align="end"> -->
<!-- 		<Message.Avatar> -->
<!-- 			<Avatar.Root> -->
<!-- 				<Avatar.Image src="/avatars/10.png" alt="@me" /> -->
<!-- 				<Avatar.Fallback>ME</Avatar.Fallback> -->
<!-- 			</Avatar.Root> -->
<!-- 		</Message.Avatar> -->
<!-- 		<Message.Content> -->
<!-- 			<Bubble.Root> -->
<!-- 				<Bubble.Content>It's a one-line change.</Bubble.Content> -->
<!-- 			</Bubble.Root> -->
<!-- 			<Message.Footer>Delivered</Message.Footer> -->
<!-- 		</Message.Content> -->
<!-- 	</Message.Root> -->
<!-- 	<Message.Root> -->
<!-- 		<Message.Avatar> -->
<!-- 			<Avatar.Root> -->
<!-- 				<Avatar.Image src="/avatars/02.png" alt="@rabbit" /> -->
<!-- 				<Avatar.Fallback>R</Avatar.Fallback> -->
<!-- 			</Avatar.Root> -->
<!-- 		</Message.Avatar> -->
<!-- 		<Message.Content> -->
<!-- 			<Bubble.Group> -->
<!-- 				<Bubble.Root variant="muted"> -->
<!-- 					<Bubble.Content>It's always a one-line change 😭.</Bubble.Content> -->
<!-- 				</Bubble.Root> -->
<!-- 				<Bubble.Root variant="muted"> -->
<!-- 					<Bubble.Content>Alright, let me take a look.</Bubble.Content> -->
<!-- 					<Bubble.Reactions aria-label="Reactions: thumbs up"> -->
<!-- 						<span>👍</span> -->
<!-- 					</Bubble.Reactions> -->
<!-- 				</Bubble.Root> -->
<!-- 			</Bubble.Group> -->
<!-- 		</Message.Content> -->
<!-- 	</Message.Root> -->
	<!-- <Marker.Root role="status"> -->
	<!-- 	<Marker.Content class="shimmer"> -->
	<!-- 		<span class="font-medium">Oliver</span> is typing... -->
	<!-- 	</Marker.Content> -->
	<!-- </Marker.Root> -->
<!-- </div> -->

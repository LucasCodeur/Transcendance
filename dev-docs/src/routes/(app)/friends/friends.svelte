<script lang="ts">
	import * as Avatar from "#lib/components/ui/avatar/index.ts";
	import * as Bubble from "#lib/components/ui/bubble/index.ts";
 	import * as Message from "#lib/components/ui/message/index.ts";
	import { Button } from "#lib/components/ui/button/index.ts";

	interface Messages {
		sender: string;
		receiver: string;
		date: string;
	}

	let { me, friends, socket, url } = $props();

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

	$effect( () => {
		if (chat !== null)
			chat.scrollTo(0, chat.scrollHeight);
	});

	let hidden=$state("hidden");
	let friendChat=$state("");
	let chat: HTMLElement | null;
	let chat_content: null | string = $state();

	let		messages_data: null | Messages[] = $state([]);
	let		splitted_messages: null | Messages[][] = $state([]);
	let		align:string = "";

	// function which split message per sender group
	// for displaying purposes
	function split_messages(messages_data) {

		if (messages_data.length === 0)
			return ;
		splitted_messages = [];
		let tmp_messages_block = [];
		tmp_messages_block.push(messages_data[0]);
		let last_sender = messages_data[0].sender;
		for (let i = 1; i < messages_data.length; i++) {
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
	}

	socket.on("new_message", (data) => {
		if (data.sender === friendChat || data.receiver === friendChat) {
			if (chat) {
				chat.scrollTo(0, chat.scrollHeight);
			}
			messages_data.push(data);
			split_messages(messages_data);
		}
	});

	function align_to_empty() {
		align = "";
	}
	function align_to_end(){
		align = "end";
	}

	async function handleMessages(friend) {
		const options  = {
					method:"POST",
					credentials: "same-origin",
					headers: {
						"Content-type": "application/json",
					},
					body: JSON.stringify({from:me, to:friend}),
				};
		const messages_response = await fetch(url + "/getMessages", options);
		messages_data = await messages_response.json();

		console.log("messages_data:");
		console.log(messages_data);
		split_messages(messages_data);

		show_chat(friend);
		if (chat !== null) {
			chat.scrollTo(0, chat.scrollHeight);
		}
		socket.on(friendChat, (data) => {
			console.log(`received a message from ${friendChat}`);
		});
		// connect to websocket 
	}
						

</script>

<div class="mb-5 rounded-sm p-2  border border-black">
	<p class="font-bold text-4xl">Friend(s):</p>
	{#if friends.length === 0}
		<p class="mt-4 ml-4">You currently have no friend, consider adding some !</p>
	{/if}
	<ul>
	{#each friends as friend}
			<li class="m-2">
				<Button 
					class="w-80/100" 
					variant="outline"
					onclick={async () => {
						handleMessages(friend);
					}}
				>
					{friend}
				</Button>
			</li>
	{/each}
	</ul>
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

		<div bind:this={chat} class="h-70/100 p-2 rounded-xl border border-black overflow-auto">
			<div class="  flex w-full  flex-col gap-6 py-12">
				{#each splitted_messages as messages_block}
					{#if messages_block[0].sender === me}
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
			</div>
		</div>

		<div class="flex justify-between">
			<input bind:value={chat_content} class="rounded-xl w-80/100 bg-taupe-50" type="text">
			<Button  
				onclick={() => {
						socket.emit("send_message", {to:friendChat, content:chat_content});
					}
				}
				variant="outline" 
				type="submit">
				send
			</Button>
		</div>

	</div>

</div>

<script lang="ts">
	import * as Avatar from "#lib/components/ui/avatar/index.ts";
	import * as Bubble from "#lib/components/ui/bubble/index.ts";
 	import * as Message from "#lib/components/ui/message/index.ts";
	import { enhance } from '$app/forms';
	import { Button } from "#lib/components/ui/button/index.ts";
	import { z } from 'zod';
	interface Friend {
		pending: string[],
		friends: string[],
		sent: string[],
	}
	import { friendRequestScheme } from '#lib/schemas/friend' 
	let { data, form } = $props();
	let clientErrors = $state({});
	let errors = $derived({
		...(form?.errors ?? {}),
		...clientErrors,
	});

	function toggle_chat_hidden() {
		if (hidden === "hidden")
			hidden = "";
		else
			hidden = "hidden";
	}

	function hide_chat(name) {
		friendChat="";
		hidden="hidden";
	}

	function show_chat(name) {
		friendChat = name;
		hidden="";
	}

	let hidden=$state("");
	let friendChat=$state("");
	let chat;

	$effect( () => {
		chat.scrollTo(0, chat.scrollHeight);
	});
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
					<Button type="sumbit" name="friend" value={pending} class="text-green-500" variant="outline">accept</Button>
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
					onclick={() => {
						// here we should set some variables
						// which would open a chatbox and a chat with the users !

						// retrieve messages

						show_chat(friend);

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

<div class="h-1000 mb-5 rounded-sm p-2  border border-black">
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
	class="p-4 rounded-xl inset-shadow-sm/50 bg-sky-100 {hidden} fixed right-3 bottom-3 size-60/100  border border-red-600"
>
	<div class="flex flex-col justify-between  h-full">

		<div class="rounded-xl flex p-4 justify-between border border-black">
			<p class="mt-auto mb-auto font-semibold">messages with {friendChat}</p>
			<div class="">
				<Button onclick={(e) =>
					{
						toggle_chat_hidden();
						chat.scrollTo(0, chat.scrollHeight);
					}
				}>x</Button>
			</div>
		</div>

		<div bind:this={chat} class="h-70/100 p-2 rounded-xl border border-black overflow-auto">
			<div class="  flex w-full  flex-col gap-6 py-12">
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
				<Message.Root>
					<Message.Avatar>
						<Avatar.Root>
							<Avatar.Image src="/avatars/02.png" alt="@rabbit" />
							<Avatar.Fallback>R</Avatar.Fallback>
						</Avatar.Root>
					</Message.Avatar>
					<Message.Content>
						<Bubble.Root variant="muted">
							<Bubble.Content>It's 4:55 PM. On a Friday.</Bubble.Content>
						</Bubble.Root>
					</Message.Content>
				</Message.Root>
				<Message.Root align="end">
					<Message.Avatar>
						<Avatar.Root>
							<Avatar.Image src="/avatars/10.png" alt="@me" />
							<Avatar.Fallback>ME</Avatar.Fallback>
						</Avatar.Root>
					</Message.Avatar>
					<Message.Content>
						<Bubble.Root>
							<Bubble.Content>It's a one-line change.</Bubble.Content>
						</Bubble.Root>
						<Message.Footer>Delivered</Message.Footer>
					</Message.Content>
				</Message.Root>
				<Message.Root>
					<Message.Avatar>
						<Avatar.Root>
							<Avatar.Image src="/avatars/02.png" alt="@rabbit" />
							<Avatar.Fallback>R</Avatar.Fallback>
						</Avatar.Root>
					</Message.Avatar>
					<Message.Content>
						<Bubble.Group>
							<Bubble.Root variant="muted">
								<Bubble.Content>It's always a one-line change 😭.</Bubble.Content>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
							<Bubble.Root variant="muted">
								<Bubble.Content>Alright, let me take a look.</Bubble.Content>
								<Bubble.Reactions aria-label="Reactions: thumbs up">
									<span>👍</span>
								</Bubble.Reactions>
							</Bubble.Root>
						</Bubble.Group>
					</Message.Content>
				</Message.Root>
			</div>
		</div>

		<div class="flex justify-between">
			<input class="rounded-xl w-70/100 bg-taupe-50" type="text">
			<input class="rounded-xl border border-black w-20/100 bg-taupe-50" type="submit" value="send">
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

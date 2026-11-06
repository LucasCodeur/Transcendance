<script lang="ts">
	import { enhance } from '$app/forms';
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
</script>


{console.log("dataaaaaaaaaaa:")}
{console.dir(data, {depth: null})}
{console.log("form:")}
{console.dir(form, {depth: null})}
<div class="mb-5 rounded-sm p-2  border border-black">
	<p class="font-bold text-4xl">Pending Friend request(s):</p>
	{#if data.pending.length === 0}
		<p class="mt-4 ml-4">No request pending...</p>
	{/if}
	{#each data.pending as pending}
		<p class="mt-4 ml-4">friend request sent to {pending}</p>
	{/each}
</div>

<div class="mb-5 rounded-sm p-2  border border-black">
	<p class="font-bold text-4xl">Friend(s):</p>
	{#if data.friends.length === 0}
		<p class="mt-4 ml-4">You currently have no friend, consider adding some !</p>
	{/if}
	{#each data.friends as friend}
		<p class="mt-4 ml-4">{friend}</p>
	{/each}
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
	<p class="font-bold text-4xl">Add Friend:</p>
	<form
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

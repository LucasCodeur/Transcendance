<script lang="ts">
	import { Button } from "#lib/components/ui/button/index.ts";
	import Friends from "./friends.svelte"
	import AddFriends from "./addFriends.svelte"
	import Pending from "./pending.svelte"
	import Sent from "./sent.svelte"

	import { io } from 'socket.io-client';

	interface Friend {
		pending: string[],
		friends: string[],
		sent: string[],
	}

	import type { PageProps } from './$types';
	let { data, form }: PageProps = $props();

	const	socket = $state(io());

	let friendData = $derived(data);

	socket.on("send_friend_request_success", async(successData) => {
		console.log("received error from websocket Server");
		console.log("successData:");
		console.log(successData);
		friendData.sent.push(successData.newFriend);
	})

	socket.on("pending_friend_request_success", async(successData) => {
		console.log("received error from websocket Server");
		console.log("successData:");
		console.log(successData);
		friendData.pending.push(successData.newFriend);
		console.log(friendData);
	})
</script>

<Pending pending={friendData.pending}/>

<Friends me={data.me} url={data.url} socket={socket} friends={friendData.friends} />


<Sent sent={friendData.sent} />


<AddFriends form={form} socket={socket}/>

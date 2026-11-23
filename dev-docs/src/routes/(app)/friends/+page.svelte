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

</script>

<Pending pending={data.pending}/>

<Friends me={data.me} url={data.url} socket={socket} friends={data.friends} />


<Sent sent={data.sent} />


<AddFriends form={form}/>

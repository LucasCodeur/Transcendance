<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<h1 class="text-2x1 font-bold">Mon compte</h1>
<p>username: {data.user.displayName}</p>
<p>email: {data.user.email}</p>
<p>emailVerified: {data.user.emailVerified ? 'true' : 'false'}</p>

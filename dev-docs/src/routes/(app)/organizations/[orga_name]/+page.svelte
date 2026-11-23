<script lang="ts">
	let { data } = $props();
</script>

<h1 class="font-bold text-4xl mb-10">{data.name}</h1>

<h2 class="font-semibold text-2xl">Users in this organization:</h2>
{console.log(data.users)}
{#each data.users as user}
	<p class="ml-10 p-1"><a href="#here" class="font-bold">{user.name}</a> is currently <a href="#here" class="font-bold">{user.role}</a></p>
{/each}


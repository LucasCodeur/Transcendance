<script lang="ts">
	import type { UserOrganization } from '#lib/interfaces/organizations/UserOrganization.ts';

	let { data } = $props();

	let my_data: UserOrganization = $derived(data);
</script>

<div class="mb-5 rounded-sm p-2  border border-black">
	Organization you are part of 
	{#each data.organizations as organization}
		<p class="underline p-3"><a href="/organizations/{organization}">{organization}</a></p>
	{/each}
</div>

<div class="mb-5 rounded-sm p-2  border border-black">
	Create an organization:
</div>

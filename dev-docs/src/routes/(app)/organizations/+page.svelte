<script lang="ts">
	import { Button } from "#lib/components/ui/button/index.ts";
	import z from 'zod';
	import { enhance } from '$app/forms';
	import { orgaCreationSchema } from "#lib/schemas/orga.ts"
	import type { UserOrganization } from '#lib/interfaces/organizations/UserOrganization.ts';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	let my_data: UserOrganization = $derived(data);
	let clientErrors = $state<Record<string, string[] | undefined>>({});
	// this will take error from form error (potentially returning from server)
	// and errors from ClientErrors (javascript part of forms)
	// so wether an error comes from the server or the client, we can display
	// it using an {#if ...}
	let errors = $derived<Record<string, string[] | undefined>>({
		...(form?.errors ?? {}),
		...clientErrors,
	});
</script>

<div class="mb-5 rounded-sm p-2  border border-black">
	<p class="font-bold text-4xl"> Your Organizations: </p>
	{#each data.organizations as organization}
		<p class="ml-5 underline p-3"><a href="/organizations/{organization}"><Button>{organization}</Button></a></p>
	{/each}
</div>

<div class="mb-5 rounded-sm p-2  border border-black">
	<p class="font-bold text-4xl">Create an organization:</p>
	<form
		class="m-5"
		method="POST"
		use:enhance={
			// use:enhance -> this activate javascript in forms 
			// formData: is dynamic object associated with the form 
			// cancel: a function to be called to avoid sending a  
			//		request to the server (for example in case some fields 
			// 		do not respect a certain condition) 
			({formData, cancel}) => {
				console.log("formData:");
				console.log(formData);
				console.log("form:");
				console.log(form);
				console.log("Object.fromEntries(formData):");
				console.log(Object.fromEntries(formData));
				// Objec.fromEntries(): convert fromData information to an object
				// safeParse(): parse data from an object and check that it
				//		matches restriction from zod Scheme 
				const parsed = orgaCreationSchema.safeParse(Object.fromEntries(formData));
				console.log("parsed:");
				console.log(parsed);
				console.log(parsed.error);
				
				// if (!parsed.success) {
				// 	clientErrors = z.flattenError(parsed.error).fieldErrors;
				// 	console.log("clientErrors:");
				// 	console.log(clientErrors);
				// 	cancel();
				// }
			}
		}
	>
		<label for="orga_name">name:</label>
		<input type="text" name="orga_name" id="orga_name" />
		{#if errors.orga_name}
			<p class="m-2 text-red-600">Errors: {errors.orga_name}</p>
		{/if}
	</form>
</div>



<script lang="ts">
  import type { PageProps } from './$types';
  import { enhance } from '$app/forms';
  import type { PageData, ActionData } from '.$types';

  let files = $state(null);
  let { form }: { form: ActionData } = $props();

  let clientErrors = $state<Record<string, string[] | undefined>>({});
  const errors = $derived<Record<string, string[] | undefined>>({
      ...(form?.errors ?? {}),
      ...clientErrors
  });

</script>

<label for="file">Upload file:</label>
<input type="file" id="file" bind:files />

{#if files && files.length > 0}
  <p>Selected: {files[0].name} ({files[0].size} bytes)</p>
{/if}

<form 
  method="POST" 
  action="?/upload" 
  enctype="multipart/form-data"
  use:enhance
>
  <input type="file" name="file" />
  <button type="submit">Upload</button>

</form>

{#if errors.file?.length}
  <ul>
  {#each errors.file as error}
    <li  role="alert" class="mt-4 rounded bg-red-50 px-3 py-2 text-sm text-red-800">{error}</li>
  {/each}
  </ul>
{/if}

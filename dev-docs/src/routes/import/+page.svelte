<script>
  let files = $state(null);
</script>

<label for="file">Upload file:</label>
<input type="file" id="file" bind:files />

{#if files && files.length > 0}
  <p>Selected: {files[0].name} ({files[0].size} bytes)</p>
{/if}

<form method="POST" action="?/upload" enctype="multipart/form-data">
  <input type="file" name="file" />
  <button type="submit">Upload</button>
</form>

<script lang="ts">
  import { useFileDialog } from '@ariefsn/svelte-use';
  const { files, open, reset } = useFileDialog({ accept: 'image/*', multiple: true });
</script>
<button onclick={open}>Select Files</button>
<button onclick={reset}>Clear</button>
<p>{files().length} file(s) selected</p>

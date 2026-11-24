<script lang="ts">
	import type { HTMLInputAttributes } from "svelte/elements";
	import { Input } from "#lib/components/ui/input/index.ts";
	import { Label } from "#lib/components/ui/label/index.ts";

	type Props = Omit<HTMLInputAttributes, 'id' | 'type' | 'files'> & {
		id: string;
		label: string;
		type?: 'text' | 'email' | 'password';
		hint?: string;
		errors?: string[];
	};

	let { id, label, type = 'text', hint, errors, class: className, ...rest}: Props = $props();
	const invalid = $derived(Boolean(errors?.length));
	const describedBy = $derived(
		[hint ? `${id}-hint` : null, invalid ? `${id}-error` : null].filter(Boolean).join(' ') || undefined
	);
</script>

<div class={['flex flex-col gap-2', className]}>
	<Label for={id}>{label}</Label>
	<Input {id} {type} aria-invalid={invalid ? 'true' : undefined} aria-describedby={describedBy} {...rest}/>
	{#if hint}
		<p id="{id}-hint" class="text-sm text-muted-foreground">{hint}</p>
	{/if}
	{#if invalid}
		<p id="{id}-error" class="text-sm text-destructive">{errors?.[0]}</p>
	{/if}
</div>

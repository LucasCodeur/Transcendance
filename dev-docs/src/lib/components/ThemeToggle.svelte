<script>
	import { mode, toggleMode } from 'mode-watcher';
	import SunIcon from '@lucide/svelte/icons/sun';
	import MoonIcon from '@lucide/svelte/icons/moon';
	import { Button } from '#lib/components/ui/button/index.ts';

	const isDark = $derived(mode.current === 'dark');
</script>

<Button variant="ghost" size="icon" class="relative" onclick={toggleMode} aria-pressed={isDark}>
	<SunIcon class="size-5 scale-100 rotate-0 transition-transform dark:scale-0 dark:-rotate-90" aria-hidden="true" />
	<MoonIcon class="absolute size-5 scale-0 rotate-90 transition-transform dark:scale-100 dark:rotate-0" aria-hidden="true" />
	<span class="sr-only">Dark mode</span>
</Button>

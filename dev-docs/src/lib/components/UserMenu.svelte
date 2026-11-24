<script lang="ts">
	import { enhance } from "$app/forms";
	import LogOutIcon from '@lucide/svelte/icons/log-out';
	import ShieldIcon from '@lucide/svelte/icons/shield';
	import UserRoundIcon from '@lucide/svelte/icons/user-round';
	import { mediaUrl } from '#lib/media.ts';
	import { getInitials } from '#lib/initials.ts';
	import * as Avatar from '#lib/components/ui/avatar/index.ts';
	import * as DropdownMenu from '#lib/components/ui/dropdown-menu/index.ts';

	type Props = {
		user: {
			displayName: string;
			email: string;
			avatarId: string | null;
		};
	};

	let { user }: Props = $props();

	const initials = $derived(getInitials(user.displayName));
</script>

<DropdownMenu.Root> 
	<DropdownMenu.Trigger
		class="rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
	>
		<Avatar.Root aria-hidden="true">
			{#if user.avatarId}
				<Avatar.Image src={mediaUrl(user.avatarId)} alt="" />
			{/if}
			<Avatar.Fallback>{initials}</Avatar.Fallback>
		</Avatar.Root>
		<span class="sr-only">Open user menu</span>
	</DropdownMenu.Trigger>

	<DropdownMenu.Content align="end" class="w-56">
		<DropdownMenu.Label class="flex flex-col gap-0.5"> 
			<span class="truncate text-sm font-medium text-foreground">{user.displayName}</span>
			<span class="truncate font-normal">{user.email}</span>
		</DropdownMenu.Label>
		<DropdownMenu.Separator />
		<DropdownMenu.Item>
			{#snippet child({ props })}
				<a href="/account" {...props}><UserRoundIcon aria-hidden="true" />Account</a>
			{/snippet}
		</DropdownMenu.Item>
		<DropdownMenu.Item>
			{#snippet child({ props })}
				<a href="/account/security" {...props}><ShieldIcon aria-hidden="true" />Security</a>
			{/snippet}
		</DropdownMenu.Item>
		<DropdownMenu.Separator />
		<!-- Logout is a POST, never a link: a GET /logout could be triggered by another site. -->
		<form method="POST" action="/logout" use:enhance>
			<DropdownMenu.Item variant="destructive" class="w-full">
				{#snippet child({ props  })}
					<button type="submit" {...props}>
						<LogOutIcon aria-hidden="true" />Log out
					</button>
				{/snippet}
			</DropdownMenu.Item>
		</form>
	</DropdownMenu.Content>
</DropdownMenu.Root>

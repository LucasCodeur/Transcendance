export function safeRedirect(target: string | null, fallback = '/account'): string {
	if (!target || !target.startsWith('/') || target.startsWith('//') || target.startsWith('/\\') || /[\x00-\x1f\x7f]/.test(target))
		return fallback;
	return (target);
}

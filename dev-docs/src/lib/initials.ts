export function getInitials(displayName: string): string {
	return (
		displayName
		.trim()
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((word) => Array.from(word)[0])
		.join('')
		.toUpperCase() || '?'
	);
}

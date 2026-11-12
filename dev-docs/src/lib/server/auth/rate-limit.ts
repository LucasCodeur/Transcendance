const attempts = new Map<string, number[]>();
const WINDOW_MS = 15 * 60 * 1000; //15min

function recentAttempts(key: string): number[] {
	const now = Date.now();
	return (attempts.get(key) ?? []).filter((at) => now - at < WINDOW_MS);
}

export function tooManyAttempts(key: string, max: number): boolean {
	const recent = recentAttempts(key);

	if (recent.length === 0) attempts.delete(key);
	else attempts.set(key, recent);
	return recent.length >= max;
}

export function recordFailure(key: string): void {
	const recent = recentAttempts(key);
	recent.push(Date.now());
	attempts.set(key, recent);
}

export function clearFailures(key: string): void {
	attempts.delete(key);
}

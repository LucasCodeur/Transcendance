import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { z } from 'zod';
import { UPLOAD_DIR } from '$app/env/private';

const ROOT = resolve(UPLOAD_DIR);
const keySchema = z.string().regex(/^[a-z]+\/[0-9a-f-]{36}$/);

function pathOf(key: string): string {
	return join(ROOT, keySchema.parse(key));
}

export async function putObject(key: string, data: Uint8Array): Promise<void>  {
	const path = pathOf(key);

	await mkdir(dirname(path), { recursive: true });
	await writeFile(path, data, { flag: 'wx' });
}

export async function getObject(key: string): Promise<Uint8Array<ArrayBuffer> | null> {
	try {
		return await readFile(pathOf(key));
	} catch (error) {
		if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return null;
		throw error;
	}
}

export async function deleteObject(key: string): Promise<void> {
	await rm(pathOf(key), { force: true });
}

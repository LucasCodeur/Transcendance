import { error } from '@sveltejs/kit';
import { getMediaFile } from '#lib/server/media/service.ts';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	const file = await getMediaFile(params.id);

	if (!file) error(404, 'Not found');

	return new Response(file.bytes, {
		headers: {
			'Content-Type': file.mimeType,
			'Cache-Control': 'private, max-age=86400',
			'X-Content-Type-Options': 'nosniff',
			'Content-Security-Policy': "default-src 'none'; sandbox"
		}
	});
};

import { deserialize, type ActionResult } from '$app/forms';

export function submitWithProgress(form: HTMLFormElement, body: FormData, onProgress: (percent: number) => void): Promise<ActionResult> {
	return new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest();

		xhr.open('POST', form.action);
		xhr.setRequestHeader('accept', 'application/json');
		xhr.setRequestHeader('x-sveltekit-action', 'true');

		xhr.upload.addEventListener('progress', (event) => {
			if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
		});
		xhr.addEventListener('load', () => resolve(deserialize(xhr.responseText)));
		xhr.addEventListener('error', () => reject(new Error('Network error')));

		xhr.send(body);
	});
}

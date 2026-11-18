import * as cookie from "cookie";
import { validateSession } from '#lib/server/auth/session.js';

export async function websocketServerAuth(socket, next)  {
	if (!socket.request.headers.cookie) {
	 	next(new Error('error while authentication of websocket'));
	}
	else {
		const provided_cookie = cookie.parseCookie(socket.request.headers.cookie);
		if (!provided_cookie.session)
			next(new Error('error while authentication of websocket'));
		else {
			const token = provided_cookie.session
			const result = await validateSession(token);
			if (!result) {
				next(new Error('error while authentication of websocket'));
			}
			else {
				if (!result.user)
					next(new Error('error while authentication of websocket'));
				socket.user = result.user;
			}
		}
	}

	next();
}

import { fail } from '@sveltejs/kit';
import { messagesRequestScheme } from '#lib/schemas/friend.ts';
import { z } from 'zod';
import { db } from '#lib/server/db/client.ts';

export async function POST({request, locals}) {
		console.log("locals user");
		if (!locals.user)
			return Response.json({status:403, errors:"not logged in!"});
		const form = await request.json();
		const parsed = messagesRequestScheme.safeParse(form);
		console.log("parsed success");
		if (!parsed.success)
			return Response.json({status:400, errors: z.flattenError(parsed.error).fieldErrors});
		console.log("coucou");
		if (locals.user.displayName !== parsed.data.from)
			return Response.json({status:403, errors: 'you can only ask for your messages'});
		const other = await db.orm.public.User.where({displayName: parsed.data.to}).first();
		if (!other)
			return Response.json({status:404, errors: 'user not found'});
		const otherId = other.id;
		const friendStatus = await db.orm.public.Friend
								.where({friendId: otherId})
								.where({userId: locals.user.id})
								.first();
		if (!friendStatus || friendStatus.type !== "accepted")
			return Response.json({status:403, errors: 'can not get message with a non friend user'});
		const messages1 = await db.orm.public.Message.where({
			senderId: locals.user.id,
			receiverId: otherId,
			}).select("timestamp", "content").all();
		for (const message of messages1) {
			message.sender = locals.user.displayName;
			message.receiver = other.displayName;
		}

		const messages2 = await db.orm.public.Message.where({
			senderId: otherId,
			receiverId: locals.user.id,
			}).select("timestamp", "content").all();
		for (const message of messages2) {
			message.sender = other.displayName;
			message.receiver = locals.user.displayName;
		}
		const messages = [...messages1, ...messages2];

		messages.sort((a,b) => {
			return  new Date(a.timestamp) - new Date(b.timestamp);
		});

		console.log("messages :");
		console.log(messages);

		return (Response.json(messages));
	}

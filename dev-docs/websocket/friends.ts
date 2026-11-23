import { friendRequestScheme } from "#lib/schemas/friend.ts";
import { db } from "#lib/server/db/client.ts";
import { fail } from "@sveltejs/kit";
import { success, z } from "zod";

// media is used to know if the function is called
// from the backend handling POST trough from no js or
// from the the websocket server
export async function handleFriendRequest(data, client, io, media) {
	console.log("from websocket, should handle sending a friend request");
	const parsed = friendRequestScheme.safeParse(data);
	if (!parsed.success) {
		const errObj = {errors:z.flattenError(parsed.error).fieldErrors};
		return choseReturnMethodError(media, errObj, 400, client);
	}

	//now check if request user does exits in the db
	try {
		const users = await db.orm.public.User.where({displayName: parsed.data.friendName}).all();
		if (users.length === 0) {
			const errObj = {errors:
					{friendName: `user ${parsed.data.friendName} does not exists!`}
			};
			return choseReturnMethodError(media, errObj, 400, client);
		}
		else if (users.length > 1) {
			const errObj = {errors: 
				{friendName: 'more than one user matches, it means all is fucked up gg!'}
			};
			return choseReturnMethodError(media, errObj, 400, client);
		}
		// here we should process the sent friend request
		const allFriend = await db.orm.public.Friend.all();
		console.log(allFriend);
		const sent = await db.orm.public.Friend.where({userId: client.user.id}).where({friendId: users[0].id}).all();
		if (sent.length > 0) {
			const errObj = {errors: 
				{friendName: 'friend request already sent!'}
			};
			return choseReturnMethodError(media, errObj, 400, client);
		}
		if (client.user.id === users[0].id) {
			const errObj = {errors: 
				{friendName: 'You can not add yourself as a friend'}
			};
			return choseReturnMethodError(media, errObj, 400, client);
		}

		// create a pending request from locals.user.id to users[0].id
		await db.orm.public.User.where({id: client.user.id}).update({
			friends: (u) => u.connect([{id: users[0].id}])
		});

		const oppositeDirection = await db.orm.public.Friend
				.where({friendId: client.user.id})
				.where({userId: users[0].id})
				.first();
		// if a connection already exists in the other direction
		// make both user friend directly !
		if (oppositeDirection !== null) {
			await db.orm.public.Friend
				.where({friendId: client.user.id})
				.where({userId: users[0].id})
				.update({type: "accepted"});
			await db.orm.public.Friend
				.where({userId: client.user.id})
				.where({friendId: users[0].id})
				.update({type: "accepted"});
		}
		console.log("from websocket, friend request should be sent now");
		const successObj = { successMessage: "friend request sent !" };
		if (media === "websocket") {
			client.emit("send_friend_request_success", successObj);
			// should loop over client, to see if concerned
			// asked friend is connected,
			// if so, should sent him a data,
			// to notify that the new friend request 
			return ;
		}
		else {
			return successObj;
		}
	} catch (e) {
		const errObj = {errors: "server error, could not process request, try again later"};
		return choseReturnMethodError(media, errObj, 500, client);
	}
}

function choseReturnMethodError(media, errObj, errCode, client) {
	if (media === "websocket") {
		client.emit("send_friend_request_error", errObj.errors);
		return ;
	}
	else {
		return fail(errCode, errObj);
	}
}

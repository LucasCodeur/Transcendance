import { friendRequestScheme } from "#lib/schemas/friend.ts";
import { fail } from "@sveltejs/kit";
import { z } from 'zod';
import { db } from '#lib/server/db/client.ts'

export async function load ({locals}){
	let data = {
		pending: [],
		friends: [],
		sent: [],
	}
	if (!locals.user)
		return data;
	console.log(locals);

	const all_friends = await db.orm.public.Friend.where({userId: locals.user.id});
	const sent_requests = await all_friends.where({type: "pending"}).all();
	for (const sent_request of sent_requests) {
		const u = await db.orm.public.User.select("displayName").where({id: sent_request.friendId}).first();
		data.sent.push(u?.displayName);
	}
	const accepted_friends = await all_friends.where({type: "accepted"}).all();

	console.log("accepted_friendss:");
	console.log(sent_requests);

	console.log("accepted_friends:");
	console.log(accepted_friends);
	return (data);
}

export const actions = {
	default: async ({request, locals}) => {
		// WARN UNCOMMENT BEFORE SHIP OR FF 
		// if (!locals.user)
		// 	return fail(400, {errors:"not logged in!"});
		const form = Object.fromEntries(await request.formData());
		const parsed = friendRequestScheme.safeParse(form);
		if (!parsed.success)
			return fail(400, {errors:z.flattenError(parsed.error).fieldErrors});

		//now check if request user does exits in the db
		try {
			const users = await db.orm.public.User.where({displayName: parsed.data.friendName}).all();
			if (users.length === 0) {
				console.log("should send back user not found!");
				return fail(400, {errors:
					{friendName: 'user does not exists!'}
				});
			}
			else if (users.length > 1)
				return fail(500, {errors: 
					{friendName: 'more than one user matches, it means all if fucked up gg!'}
				});
			// here we should process the sent friend request
			const allFriend = await db.orm.public.Friend.all();
			console.log(allFriend);
			const sent = await db.orm.public.Friend.where({userId: locals.user.id}).where({friendId: users[0].id}).all();
			console.log(`sent.length = ${sent.length}`);
			console.log(`users[0].id = ${users[0].id}`);
			console.log(`locals.user.id = ${locals.user.id}`);
			if (sent.length > 0) {
				return fail(400, {errors: 
					{friendName: 'friend request already sent!'}
				});
			}
			if (locals.user.id === users[0].id)
				return fail(400, {errors: 
					{friendName: 'You can not add yourself as a friend'}
				});
			await db.orm.public.User.where({id: locals.user.id}).update({
				friends: (u) => u.connect([{id: users[0].id}])
			});
			return {
				successMessage: "friend request sent !",
			}
		} catch (e) {
			return fail(500, {errors: "server error, could not process request, try again later"});
		}
	}
}

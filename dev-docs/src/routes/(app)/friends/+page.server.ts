import { friendRequestScheme, friendAcceptDenyScheme } from "#lib/schemas/friend.ts";
import { fail } from "@sveltejs/kit";
import { z } from 'zod';
import { db } from '#lib/server/db/client.ts'

export async function load ({locals}){
	let data = {
		me: undefined,
		pending: [],
		friends: [],
		sent: [],
	}
	if (!locals.user)
		return data;
	data.me = locals.user.displayName;

	const all_friends = await db.orm.public.Friend.where({userId: locals.user.id});

	const sent_requests = await all_friends.where({type: "pending"}).all();
	for (const sent_request of sent_requests) {
		const u = await db.orm.public.User.select("displayName").where({id: sent_request.friendId}).first();
		data.sent.push(u?.displayName);
	}

	const accepted_friends = await all_friends.where({type: "accepted"}).all();
	for (const accepted_friend of accepted_friends) {
		const u = await db.orm.public.User.select("displayName").where({id: accepted_friend.friendId}).first();
		data.friends.push(u?.displayName);
	}

	const incoming_friends = await db.orm.public.Friend.where({friendId: locals.user.id}).where({type: "pending"}).all();
	for (const incoming_friend of incoming_friends) {
		const u = await db.orm.public.User.select("displayName").where({id: incoming_friend.userId}).first();
		data.pending.push(u?.displayName);
	}

	return (data);
}

export const actions = {
	create: async ({request, locals}) => {
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
			// WARN; should check if a connection already exists in the other direction
			// if that is the case, then directly make user friend
			await db.orm.public.User.where({id: locals.user.id}).update({
				friends: (u) => u.connect([{id: users[0].id}])
			});

			const oppositeDirection = await db.orm.public.Friend
					.where({friendId: locals.user.id})
					.where({userId: users[0].id})
					.first();
			if (oppositeDirection !== null) {
				await db.orm.public.Friend
					.where({friendId: locals.user.id})
					.where({userId: users[0].id})
					.update({type: "accepted"});
				await db.orm.public.Friend
					.where({userId: locals.user.id})
					.where({friendId: users[0].id})
					.update({type: "accepted"});
			}
			return {
				successMessage: "friend request sent !",
			}
		} catch (e) {
			return fail(500, {errors: "server error, could not process request, try again later"});
		}
	},

	accept_deny: async({request, locals}) => {
		// WARN UNCOMMENT BEFORE SHIP OR FF 
		// if (!locals.user)
		// 	return fail(400, {errors:"not logged in!"});
		

		//const form = Object.fromEntries(await request.formData());
		//const parsed = friendRequestScheme.safeParse(form);

		const form = Object.fromEntries(await request.formData());
		const parsed = friendAcceptDenyScheme.safeParse(form);
		if (!parsed.success)
			return fail(400, { errors: z.flattenError(parsed.error).fieldErrors });

		// retrieving user 
		const userToAccept = await db.orm.public.User.where({displayName: parsed.data.friend}).first();
		if (userToAccept === null)
			return fail(400, { errors: { friend: "user to accept not found" } });

		// must check if user is currently asking for a friend request !
		console.log("locals");
		console.log(locals);
		const matchingPendingRequest = await db.orm.public.Friend
						.where({friendId: locals.user.id})
						.where({userId: userToAccept.id})
						.first();
		if (matchingPendingRequest === null)
			return fail(400, {errors: { friend: `${userToAccept.displayName} did not sent a request`}});


		if (parsed.data.type === 'accept') {
			// add a connection in the other side !
			await db.orm.public.User.where({displayName: locals.user.displayName}).update({
				friends: (f) => f.connect({id: userToAccept.id})
			});
			// change status of both connection from 
			// "pending" to "accpeted"
			await db.orm.public.Friend
				.where({userId: userToAccept.id})
				.where({friendId: locals.user.id})
				.update({type:"accepted"});
			await db.orm.public.Friend
				.where({friendId: userToAccept.id})
				.where({userId: locals.user.id})
				.update({type:"accepted"});
		}

		if (parsed.data.type === 'deny') {
			await db.orm.public.Friend
						.where({friendId: locals.user.id})
						.where({userId: userToAccept.id})
						.delete();
		}



	},
}

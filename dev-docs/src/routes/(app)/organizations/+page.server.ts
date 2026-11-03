import type { UserOrganization } from '#lib/interfaces/organizations/UserOrganization.ts';

import { db } from "#lib/server/db/client.js";
import { redirect } from '@sveltejs/kit';
import { error } from 'node:console';

export async function load({ locals }) {
	let data:UserOrganization = {
		organizations:[],
	}
	if (!locals.user)
		return data;


	// user init 
	// console.log("locals:");
	// console.log(locals);
		// await db.orm.public.User.
		// where({email: locals.email}).
		// update({
		// 	organizations: (orga) => orga.connect([{id: my_orga.id}]),
		// });
	let my_users = await db.orm.public.User.where(
			{email: locals.user.email}
	).include("organizations").all();
	if (my_users.length !== 1)
		redirect(301, "/account");

	console.log(my_users);
	let my_user = my_users[0];
	for (const organization of my_user?.organizations)
		data.organizations.push(organization.name);

	return (data);
}

import type { UserOrganization } from '#lib/interfaces/organizations/UserOrganization.ts';
import { orgaCreationSchema } from '#lib/schemas/orga.ts';
import { db } from "#lib/server/db/client.js";
import { redirect } from '@sveltejs/kit';
import { fail } from '@sveltejs/kit';
import { z } from 'zod';

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

export const actions = {
	default: async ({request, locals}) => {
		console.log("locals:");
		console.log(locals);
		console.log("coucou");
		if (!locals.user)
			return fail(400, {errors:"not logged in!"});

		const form = Object.fromEntries(await request.formData());
		const parsed = orgaCreationSchema.safeParse(form);
		console.log("parsed:");
		console.log(parsed);
		if (!parsed.success)
		 	return fail(400, {  errors: z.flattenError(parsed.error).fieldErrors});

		const orga_list = await db.orm.public.Organization.where({name: parsed.data.orga_name}).all();
		if (orga_list.length !== 0)
			return fail(400, { errors: {orga_name: "organization already exists"} });

		try {
			const new_org = await db.orm.public.Organization.create({name: parsed.data.orga_name});
			const user = await db.orm.public.User.where({email: locals.user.email}).update({
				organizations: (orga) => orga.connect({id: new_org.id}),
			});
			await db.orm.public.UserOrganizations.where({userId: user.id}).where({organizationId: new_org.id}).update(
				{role: "owner"});
			new_org.id;
		} catch (e) {
			return ({
				errors: e
			})
		}

		console.log("after parsed success");
		return ({
			message:"coucou",
		});
	}
}

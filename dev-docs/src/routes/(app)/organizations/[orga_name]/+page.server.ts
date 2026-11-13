import { redirect } from "@sveltejs/kit";
import { error } from "@sveltejs/kit";
import { db } from "#lib/server/db/client.ts";

interface OrgaUser {
	name: string,
	role: string,
}

interface Orga {
	name: string | undefined,
	users: OrgaUser[],
}

export async function load({params, locals}) {

	const orga_data: Orga = {
		name:undefined,
		users: [],
	}
	if (!locals.user)
		return orga_data;
	console.log(params);
	
	const orga_all = await db.orm.public.Organization.where({name: params.orga_name}).all();
	if (orga_all.length !== 1)
		error(404);
	const orga_id = orga_all[0].id;

	// check wether the user is in the organisation !
	const orga = await db.orm.public.UserOrganizations.
		where({userId:locals.user.id}).
		where({organizationId:orga_id}).include("user").all();
	if (orga.length !== 1)
		error(404);

	const orga_members = await db.orm.public.UserOrganizations.
		where({organizationId:orga_id}).include("user").select("role").all();

	//console.log(`orga_id = ${orga_id}`);
	// const second = await db.orm.public.Organization.where({name: "second_org"}).first();
	// await db.orm.public.User.
	// 	where({displayName: "jules"}).
	// 	update({organizations: (orga) => orga.connect([{id: second.id}])});

	// await db.orm.public.User.
	// 	where({email: "enzo@mail.com"}).
	// 	update({organizations: (orga) => orga.connect([{id: orga_id}])});

	console.log("orga:");
	console.log(orga);

	for (const member of orga_members){
		orga_data.users.push({
			name: member.user.displayName,
			role: member.role,
		});
	}
			

	// const orga_all = await db.orm.public.UserOrganizations.
	// 	where({userId = locals.
	/*
	const orga_all = await db.orm.public.Organization.
		where({name: params.orga_name}).
		include("users").all();
	if (orga_all.length !== 1)
		error(404, "Not Found");
	const orga_db = orga_all[0];
	orga_data.name = orga_db.name;
	console.log(orga_db);
	for (const user of orga_db.users) {
		console.log(`coucou: ${user.displayName}`);
		orga_data.users.push(user.displayName);
	}
	*/
	return (orga_data);
}

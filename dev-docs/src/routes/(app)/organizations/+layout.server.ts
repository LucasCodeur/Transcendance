import { db } from "#lib/server/db/client.ts";

const users = await db.orm.public.User.all();

console.log("~~~~~~~~~~~~~~~~~~~~~~~");
console.log("all users in db:");
for (const user of users)
	console.log(`	- ${user.displayName}`);

console.log("all oragnisation in db:");
const orgas = await db.orm.public.Organization.all();
for (const orga of orgas)
	console.log(`	- ${orga.name}`);
console.log("~~~~~~~~~~~~~~~~~~~~~~~");

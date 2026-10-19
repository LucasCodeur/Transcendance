import { db } from "./src/prisma/db";

async function main() {

  let ulysse = await db.orm.public.User.where({name: "ulysse"}).all();
  let Ulysse = await db.orm.public.User.where({name: "Ulysse"}).all();
  if ( ulysse.length == 0  && Ulysse.length == 0)
  {
    const created = await db.orm.public.User.create({
      email: "ulysse@example.com",
      name: "Ulysse",
    });
    console.log("Created:", created);
  }

  ulysse = await db.orm.public.User.where({name: "Ulysse"}).all();
  console.log("Ulysse:");
  console.log(ulysse);


  let tommy = await db.orm.public.User.where({name: "tommy"}).all();
  console.log("tommy:");
  console.log(tommy);

  // changing name of Ulysse to ulysse
  console.log("changing name of Ulysse to ulysse");
  await db.orm.public.User.where({name:"Ulysse"}).update({name: "ulysse"});

  ulysse = await db.orm.public.User.where({name: "Ulysse"}).all();
  console.log("Ulysse:");
  console.log(ulysse);

  ulysse = await db.orm.public.User.where({name: "ulysse"}).all();
  console.log("ulysse:");
  console.log(ulysse);

	
  // changing back to Ulysse
  console.log("changing back to Ulysse");
  await db.orm.public.User.where({name:"ulysse"}).update({name: "Ulysse"});

  ulysse = await db.orm.public.User.where({name: "Ulysse"}).all();
  console.log("Ulysse:");
  console.log(ulysse);

  ulysse = await db.orm.public.User.where({name: "ulysse"}).all();
  console.log("ulysse:");
  console.log(ulysse);

	// TO CREATE SOME POSTS FROM A USER
	//  await db.orm.public.User.where({name: "Ulysse"}).update({
	// name:"Ulysse",
	//  	email:"Ulysse@mail.com",
	// posts: (p) => p.create([{ title: "first_post ulysse" }]),
	//  });
	//
	//  await db.orm.public.User.where({name:"enzo"}).update(
	//  {
	//  	name:"enzo",
	//  	email:"enzo@mail.com",
	//  	posts: (p) => p.create([
	//  		{title:"first enzo post"}
	//  	]),
	//  });


  //let users;
  //users = await db.orm.public.User.all();
  //  console.log("all users are : ");
  //console.log(users);

  //await db.orm.public.User.where({name : "Ulysse"}).delete();

  //await db.orm.public.User.all();
  //console.log("all users are : ");
  //users = await db.orm.public.User.all();
  //console.log(users);

  db.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

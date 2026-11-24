// ************************************************************************** //
//                                                                            //
//                                                        :::      ::::::::   //
//   script.ts                                          :+:      :+:    :+:   //
//                                                    +:+ +:+         +:+     //
//   By: lud-adam <lud-adam@student.42.fr>          +#+  +:+       +#+        //
//                                                +#+#+#+#+#+   +#+           //
//   Created: 2026/10/14 14:20:24 by lud-adam          #+#    #+#             //
//   Updated: 2026/10/20 17:03:47 by lud-adam         ###   ########.fr       //
//                                                                            //
// ************************************************************************** //

import { db } from "./src/prisma/db";

async function printUsers() {
  console.log("PRINT USERS BEGIN");
  const users = await db.orm.public.User.all();
  console.log("All users:", users);
  console.log("PRINT USERS END");
}

async function printPosts() {
  console.log("PRINT POSTS BEGIN");
  const posts = await db.orm.public.Post.all();
  console.log("All posts:", posts);
  console.log("PRINT POSTS END");
}

async function printAll() {
  console.log("PRINT ALL BEGIN");
  await printUsers();
  await printPosts();
  console.log("PRINT ALL END");
}

async function deleteUserPost() {
  console.log("DELETE USERS POST END");
  console.log("BEGIN DELETE\n");
  const deletedBromance = await db.orm.public.Post.where({
    title: "Bromance",
  }).delete();
  const deletedUser = await db.orm.public.User.where({
    email: "GegeAkutami@example.com",
  }).delete();
  console.log("DELETE USERS POST END");
}

async function addUsers() {
  console.log("ADD USERS BEGIN");
  const mangaka = await db.orm.public.User.create({
    email: "GegeAkutami@example.com",
    name: "Gege Akutami",
  });
  const mangaka2 = await db.orm.public.User.create({
    email: "AkiraToriyama@example.com",
    name: "Akira Toriyama",
  });
  console.log("ADD USERS END");
}

async function addPosts() {
  const mangakaJujutsu = await db.orm.public.User.where({
    email: "GegeAkutami@example.com",
  }).first();
  if (mangakaJujutsu === null) console.log("prout");
  if (mangakaJujutsu === null) return;
  const postJujutsu = await db.orm.public.Post.create({
    title: "Jujutsu Kaisen",
    content: "Best chore in term of fighting",
    authorId: mangakaJujutsu.id,
  });
  const mangakaDragon = await db.orm.public.User.where({
    name: "Akira Toriyama",
  }).first();
  const post = await db.orm.public.Post.create({
    title: "Dragon ball",
    content: "The dad of the mangas",
    authorId: mangakaDragon?.id,
  });
  console.log("ADD POSTS END");
}

async function deleteAllUsers() {
  console.log("DELETE ALL USERS BEGIN");
  const deleted = await db.orm.public.User.deleteAll();
  console.log("DELETE ALL USERS END");
}

async function deleteAllPosts() {
  console.log("DELETE ALL POSTS BEGIN");
  const deleted = await db.orm.public.Post.deleteAll();
  console.log("DELETE ALL POSTS END");
}

async function deleteAllMedecin() {
  console.log("DELETE ALL MEDECIN BEGIN");
  const deleted = await db.orm.public.Medecin.deleteAll();
  console.log("DELETE ALL MEDECIN END");
}

async function deleteAllPatient() {
  console.log("DELETE ALL PATIENT BEGIN");
  const deleted = await db.orm.public.Patient.deleteAll();
  console.log("DELETE ALL PATIENT END");
}

async function deleteAllPatientMedecin() {
  console.log("DELETE ALL PATIENT BEGIN");
  const deleted = await db.orm.public.PatientMedecin.deleteAll();
  console.log("DELETE ALL PATIENT END");
}

async function addMultipleUsers(nb) {
  console.log("ADD MULTIPLE USER BEGIN\n");
  for (let i = 0; i < nb; i++) {
    const multipleCreate = await db.orm.public.User.create({
      name: createRandomString(5),
      email: createRandomString(20),
    });
  }
  console.log("ADD MULTIPLE USER END\n");
}

function createRandomString(length) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function findUsersLimitedRange(limit, offset) {
  const page = await db.orm.public.User.orderBy((p) => p.createdAt.desc())
    .limit(limit)
    .offset(offset)
    .all();
  console.log("Find user limit range", page);
}

async function findUsersBy() {
  console.log("Find User By BEGIN\n");
  // Second page of posts, newest first
  const user = await db.orm.public.User.orderBy((p) => p.createdAt.desc())
    .limit(10)
    .offset(0)
    .all();
  console.log("find user by: \n", user);
}

async function countUsers() {
  const result = await db.orm.public.User.where({}).aggregate((a) => ({
    total: a.count(),
  }));
  console.log("result: ", result);
}

async function printUser(User: typeof User) {
  console.log("Test print User", User);
}

async function iterateThroughUsersAndAwait() {
  console.log("ITERATE TRHOUGH USER AND AWAIT BEGIN\n");
  for await (const post of db.orm.public.User.all()) {
    await printUser(post);
  }
}

async function testUseMultipleTimeUsers() {
  const users = await db.orm.public.User.all();
  console.log("users inside test", users);
  const name = users.filter((p) => p.name);
  const content = users.map((p) => p.content);
  console.log("name: ", name);
  console.log("content: ", content);
}

async function testTryCatch() {
  try {
    await db.orm.public.User.create({
      email: "GegeAkutami@example.com",
      name: "Gege Akutami",
    });
  } catch (error) {
    if ((error as { sqlState?: string }).sqlState === "23505") {
      console.log("email is already taken\n");
    }
  }
}

async function testCreateRecordedWithOtherRecord() {
  await db.orm.public.User.create({
    email: "newPlayer@example.com",
    name: "newPlayer",
    posts: (p) => p.create([{ title: "First post", content: null }]),
  });
}

async function testUpdatingUserWithNewPost() {
  const user = await db.orm.public.User.create({
    email: "prout@example.com",
    name: "Prout",
  });

  const post = await db.orm.public.Post.create({
    title: "hello",
    content: "hello",
    authorId: user.id,
  });

  const user2 = await db.orm.public.User.create({
    email: "prout2@example.com",
    name: "Prout2",
  });

  const post2 = await db.orm.public.Post.create({
    title: "hello2",
    content: "hello2",
    authorId: user2.id,
  });
  //
  await db.orm.public.User.where({ email: "prout@example.com" }).update({
    posts: (p) => p.connect([{ id: post2.id }]),
  });

  await db.orm.public.User.where({ email: "prout2@example.com" }).update({
    posts: (p) => p.connect([{ id: post.id }]),
  });
}

async function testUpsert() {
  const user = await db.orm.public.User.upsert({
    create: { email: "blabla", name: "blabla" },
    update: { name: "test" },
    conflictOn: { email: "blabla" },
  });
  // console.log("user: ", user);
  // printAll();
}

async function testTransaction() {
  console.log("TEESTTT TRANSACTION\n");
  const result = await db.transaction(async (tx) => {
    const user = await tx.orm.public.User.create({
      email: "jane@prisma.io",
      name: "Jane",
    });
    const post = await tx.orm.public.Post.create({
      title: "Hello",
      authorId: user.id,
    });
    return { userId: user.id, postId: post.id }; // both records exist once this returns
  });
}

async function testInclude() {
  console.log("TEST test include");
  const user = await db.orm.public.User.where({
    email: "GegeAkutami@example.com",
  })
    .include("posts")
    .first();
  console.log("user: ", user);
}

async function testManyToMany() {
  console.log("Test many to many\n");
  const medecin = await db.orm.public.Medecin.create({ name: "Docteur Weber" });
  const patient = await db.orm.public.Patient.create({ name: "Gauthier" });
  const patient2 = await db.orm.public.Patient.create({ name: "Jocelyn" });
  const medecinPatient = await db.orm.public.PatientMedecin.create({
    medecinId: medecin.id,
    patientId: patient.id,
  });
  const medecinPatient2 = await db.orm.public.PatientMedecin.create({
    medecinId: medecin.id,
    patientId: patient2.id,
  });
}

async function queryMedecin() {
  console.log("Query Medecin\n");
  // const medecinWithPatient = await db.orm.public.PatientMedecin.where({})
  //   .include("medecin")
  //   .include("patient")
  //   .where({})
  //   .all();

  const medecinWithPatient = await db.orm.public.Medecin.where({})
    .include("patientMedecin")
    .all();

  // users[0].posts is an array of the user's posts
  console.log("medecin With Patient: ", medecinWithPatient);
}

async function main() {
  await deleteAllPosts();
  await deleteAllUsers();
  await deleteAllPatientMedecin();
  await deleteAllMedecin();
  await deleteAllPatient();
  // await printAll();
  // await addUsers();
  // await addPosts();
  // await addMultipleUsers(2);
  // await iterateThroughUsersAndAwait();
  // await printAll();
  // await testTryCatch();
  // await testCreateRecordedWithOtherRecord();
  // await testUpdatingUserWithNewPost();
  // await testUpsert();
  // await testTransaction();
  await testManyToMany();
  await queryMedecin();
  // await testUseMultipleTimeUsers();
  // await testInclude();
  // await printAll();
  // await findUsersLimitedRange(2, 2);
  // await findUsersBy();
  // countUsers();
  await db.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

// namespace test {
//
// model ia {
//   id      Int     @id @default(autoincrement())
//   title   String
//   content String?
// }
//
// }

// model User {
//   id        Int               @id @default(autoincrement())
//   email     String            @unique
//   username  String?
//   name      String?
//   posts     Post[]
//   phone     String?
//   createdAt TimestamptzString @default(now())
//   updatedAt temporal.updatedAtString()
// }
//
// model Post {
//   id        Int               @id @default(autoincrement())
//   title     String
//   content   String?
//   author    User              @relation(fields: [authorId], references: [id])
//   authorId  Int
//   createdAt TimestamptzString @default(now())
//   updatedAt temporal.updatedAtString()
// }
//

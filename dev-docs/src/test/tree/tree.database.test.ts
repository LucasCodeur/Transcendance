import { createPerson, genea } from "../../person/person.database";

import { sInputPerson } from "../../person/person.inputValidation";

export async function testCreateInputPerson(
  firstName: String,
  lastName: String,
  gender: String,
  birthDate: String,
  deceased: Boolean,
  birthPlace: String,
) {
  const inputPerson = sInputPerson.parse({
    firstName: firstName,
    lastName: lastName,
    gender: gender,
    birthDate: new Date(birthDate), //WARN: Weird behavior: if I put 2000-1-1 it works, but the date isn't the same. According to the documentation, it normally shouldn't work
    deceased: deceased,
    birthPlace: birthPlace,
  });
  return inputPerson;
}

export async function testCreateTree() {
  console.log("TEST CREATE PERSON:");
  await genea.ChildLink.where({}).deleteAll();
  await genea.PartnerLink.where({}).deleteAll();
  await genea.Partnership.where({}).deleteAll();
  await genea.Person.where({}).deleteAll();
  await genea.Tree.where({}).deleteAll();
  const weberFamily = await genea.Tree.create({
    name: "The Weber family",
  });
  // console.log("Weber Family: ", weberFamily.name);
  const inputJulesWeber = await testCreateInputPerson(
    "Jules",
    "Weber",
    "Male",
    "2000-01-01",
    false,
    "Chine",
  );
  const inputPdp = await testCreateInputPerson(
    "Paul",
    "Pepetrini",
    "Male",
    "2000-02-02",
    false,
    "Inde",
  );
  const inputAchille = await testCreateInputPerson(
    "Achille",
    "Betemps",
    "Male",
    "2005-01-01",
    false,
    "France",
  );
  const julesWeber = await createPerson(inputJulesWeber, weberFamily.id);
  const paulDp = await createPerson(inputPdp, weberFamily.id);
  const AchilleBetemps = await createPerson(inputAchille, weberFamily.id);

  // console.log("Weber Family: ", weberFamily);
  // console.log(julesWeber);
  // console.log(paulDp);

  const partnerShipJW = await genea.Partnership.create({
    type: "Couple",
  });

  const partnerLinkJulesWeber = await genea.PartnerLink.create({
    personId: julesWeber.id,
    partnershipId: partnerShipJW.id,
  });

  const partnerLinkPdp = await genea.PartnerLink.create({
    personId: paulDp.id,
    partnershipId: partnerShipJW.id,
  });

  const partnerLinkAchille = await genea.ChildLink.create({
    personId: AchilleBetemps.id,
    partnershipId: partnerShipJW.id,
  });

  const weberFamilyTest = await genea.Tree.select("name")
    .include(
      "persons",
      (persons) =>
        persons
          .select("firstName", "lastName")
          .include("partnerLink", (partnerLink) =>
            partnerLink
              .select("personId")
              .include("partnerShip", (partnerShip) =>
                partnerShip.select("type"),
              ),
          ),
      // .include("childLink"),
      // .select("partnership"),
    )
    .all();

  // const weberPartnerShip = await genea.Partnership.select("type")
  //   .include("partnerLink", (partnerLink) => partnerLink.select("personId"))
  // .include("childLink")
  // .all();
  // console.log("Weber Family test: ", weberFamilyTest[0]);
  // console.log(weberFamilyTest[0]);
  console.log(weberFamilyTest[0].persons[0]);
  console.log(weberFamilyTest[0].persons[0].partnerLink[0]);
  // console.log(weberFamilyTest[0].persons[2]);
  console.log(weberFamilyTest[0].persons[1]);
  console.log(weberFamilyTest[0].persons[1].partnerLink[0]);
  // console.log(weberFamilyTest[0].persons[2].partnerLink[0]);
  // console.log("Weber PartnerShip: ", weberPartnerShip);
}

// const usersWithPostsAndComments = await db.orm.public.User.include(
//   "posts",
//   (post) => post.include("comments"),
// ).all();
// Array<{
//   id;
//   email;
//   posts: Array<{
//     id;
//     title;
//     published;
//     createdAt;
//     authorId;
//     comments: Comment[];
//   }>;
// }>;

// const parent = await prisma.parent.findUnique({
//   where: { id: 1 },
//   include: {
//     children: true, // This fetches the child relation
//   },
// });

// console.log(parent.children); // Displays array of children

async function main() {
  await testCreateTree();
  // await db.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

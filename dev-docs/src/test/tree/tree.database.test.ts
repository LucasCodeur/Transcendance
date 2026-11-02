// ************************************************************************** //
//                                                                            //
//                                                        :::      ::::::::   //
//   tree.database.test.ts                              :+:      :+:    :+:   //
//                                                    +:+ +:+         +:+     //
//   By: lud-adam <>                                +#+  +:+       +#+        //
//                                                +#+#+#+#+#+   +#+           //
//   Created: 2026/10/29 13:40:38 by lud-adam          #+#    #+#             //
//   Updated: 2026/10/29 16:19:44 by lud-adam         ###   ########.fr       //
//                                                                            //
// ************************************************************************** //

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
    personId: paulDp.id,
    partnershipId: partnerShipJW.id,
  });
  // console.log("partner link jules weber: ", partnerLinkJulesWeber);

  const partnerLinkPdp = await genea.PartnerLink.create({
    personId: julesWeber.id,
    partnershipId: partnerShipJW.id,
  });

  // console.log("partner link pdp: ", partnerLinkPdp);

  const partnerLinkAchille = await genea.ChildLink.create({
    personId: AchilleBetemps.id,
    partnershipId: partnerShipJW.id,
  });

  const weberFamilyTest = await genea.Tree.select("name")
    .include("persons", (persons) =>
      persons
        .select(
          "firstName",
          "lastName",
          "birthDate",
          "birthPlace",
          "deceased",
          "id",
        )
        .include("partnerLink", (partnerLink) =>
          partnerLink
            .select("personId", "id", "partnershipId")
            .include("partnerShip", (partnerShip) =>
              partnerShip
                .select("type", "id")
                .include("childLink", (childLink) =>
                  childLink.select("personId", "partnershipId", "id"),
                ),
            ),
        ),
    )
    .all();
  printTree(weberFamilyTest[0]);
}

async function printTree(tree) {
  console.log("Family Tree: ", tree.name);
  for (let person of tree.persons) {
    await printPerson(person);
    break;
  }
}

async function printPerson(person) {
  console.log("First name: ", person.firstName);
  console.log("Last name: ", person.lastName);
  console.log("Birth date: ", person.birthDate);
  console.log("Birth place: ", person.birthPlace);
  console.log("Dead: ", person.deceased == false ? "No" : "Yes");
  // console.log("Id: ", person.id);
  printRelations(person.partnerLink);
}

async function printRelations(partnerLink) {
  const relationShip = await genea.Partnership.where({
    id: partnerLink.partnerShipId,
  })
    .include("partnerLink", (partnerLink) => partnerLink.select("personId"))
    .first();
  const partners = await genea.Person.where({
    id: partnerLink.personId,
  }).all();
  console.log(relationShip.type, "with", partners[1].firstName);
  console.log("Children :", partners[2].firstName);
}

async function main() {
  await testCreateTree();
  // await db.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

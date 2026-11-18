import { db } from "../../../prisma/db.ts";

import type { Person } from "../../schemas/gedcom/gedcomSchemas.ts";

namespace geneaDB {
  export let genea = db.orm.genealogy;

  export async function addPerson(person: Person, treeId: string, relations) {
    const newPerson = await genea.Person.create({
      fullName: person.fullName,
      givenName: person.givenName,
      surName: person.surName,

      gender: person.gender,

      birthDate: new Date(person.birthDate),
      birthPlace: person.birthPlace,
      birthAdress: person.birthAdress,

      deceased: person.deceased,

      deathDate: new Date(person.deathDate),
      deathPlace: person.deathDate,

      treeId: treeId,
    });

  }

  namespace utils {

    async function printTree(tree) {
      console.log("Family Tree: ", tree.name);
      for (let person of tree.persons) {
        await printPerson(person);
        break;
      }
    }

    async function printPerson(person: Person) {

      console.log("Id: ", person.id);

	  console.log("Gender: ", person.gender);

      console.log("Given name: ", person.givenName?);
      console.log("Surname", person.surName);

      console.log("Birth date: ", person.birthDate);
      console.log("Birth place: ", person.birthPlace);
      console.log("Birth adress: ", person.birthAdress);

      console.log("Dead: ", person.deceased == false ? "No" : "Yes");
	
      console.log("Death date: ", person.deathDate);
      console.log("Death place: ", person.deathPlace);
      console.log("Birth adress: ", person.birthAdress);

      await printRelations(person.partnerLink);
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
  }
}

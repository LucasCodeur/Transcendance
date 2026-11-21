import { db } from "../../../prisma/db.ts";

import type { Person } from "../../schemas/gedcom/gedcomSchemas.ts";

export namespace geneaDB {
  export const genea = db.orm.genealogy;

  export async function addPerson(person: Person, treeId: string) {
    const newPerson = await genea.Person.create({
      gedcomId: person.gedcomId,
      fullName: person.fullname,
      givenName: person.givenname,
      surName: person.surname,

      gender: person.gender ?? null,

      birthDate: dateOrNull(person.birth?.date),
      birthPlace: person.birth?.place ?? null,
      birthAdress: person.birth?.address ?? null,

      deceased: person.deceased ?? false,

      deathDate: dateOrNull(person.death?.date),
      deathPlace: person.death?.place ?? null,

      treeId: treeId,
    });
    return newPerson;
  }

  function dateOrNull(value?: string): Date | null {
    if (!value) return null;

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return null;
    return date;
  }
  // export async function addRelations(person: Person)
  // {
  //
  // }

  namespace utils {
    async function printTree(tree) {
      console.log("Family Tree: ", tree.name);
      for (let person of tree.persons) {
        await printPerson(person);
        break;
      }
    }

    async function printPerson(person: Person) {
      console.log("Id: ", person.gedcomId);

      console.log("Gender: ", person.gender);

      console.log("Full name: ", person.fullname);
      console.log("Given name: ", person.givenname);
      console.log("Surname: ", person.surname);
      console.log("Nickname: ", person.nickname);
      console.log("Married name: ", person.marriedname);

      console.log("Birth date: ", person.birth?.date);
      console.log("Birth place: ", person.birth?.place);
      console.log("Birth address: ", person.birth?.address);

      console.log("Dead: ", person.deceased === true ? "Yes" : "No");

      console.log("Death date: ", person.death?.date);
      console.log("Death place: ", person.death?.place);
      console.log("Death address: ", person.death?.address);

      console.log("Burial date: ", person.burial?.date);
      console.log("Burial place: ", person.burial?.place);
      console.log("Burial address: ", person.burial?.address);

      console.log("Occupations: ", person.occupations);
      console.log("Education: ", person.education);
      console.log("Nationality: ", person.nationality);
      console.log("Religion: ", person.religion);

      // console.log("Family as spouse: ", person.familyAsSpouseIds);
      // console.log("Family as child: ", person.familyAsChildIds);

      // console.log("Notes: ", person.notes);
      // console.log("Sources: ", person.sources);
      // console.log("Objects: ", person.objectIds);
    }

    // async function printRelations(partnerLink) {
    //   const relationShip = await genea.Partnership.where({
    //     id: partnerLink.partnerShipId,
    //   })
    //     .include("partnerLink", (partnerLink) => partnerLink.select("personId"))
    //     .first();
    //   const partners = await genea.Person.where({
    //     id: partnerLink.personId,
    //   }).all();
    //   console.log(relationShip.type, "with", partners[1].firstName);
    //   console.log("Children :", partners[2].firstName);
    // }
  }
}

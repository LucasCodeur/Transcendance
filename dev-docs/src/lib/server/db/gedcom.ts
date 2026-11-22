import { db } from "../../../prisma/db.ts";

import type { Person, Family } from "#lib/schemas/gedcom/gedcomSchemas.ts";

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

  export async function addRelations(
    family: Family,
    treeId: String,
    partnershipId: String,
  ) {
    if (family.husdbandGedcomId != undefined) {
      const person = await genea.Person.where({
        treeId: treeId,
        gedcomId: family.husdbandGedcomId,
      }).first();
      if (person != null) {
        console.log("HUSBAND PARTNERLINK IS CREATING");
        const partnerLink = await genea.PartnerLink.create({
          personId: person?.id,
          gedcomId: family.husdbandGedcomId,
          partnershipId: partnershipId,
          type: "HUSB",
        });
      }
    }
    if (family.wifeGedcomId != undefined) {
      console.log("INSIDE FAMILY WIFW DIFFERENT UNDEFINED");
      const person = await genea.Person.where({
        treeId: treeId,
        gedcomId: family.wifeGedcomId,
      }).first();
      if (person != null) {
        console.log("WIFE PARTNERLINK IS CREATING");
        const partnerLink = await genea.PartnerLink.create({
          personId: person?.id,
          gedcomId: family.wifeGedcomId,
          partnershipId: partnershipId,
          type: "WIFE",
        });
      }
    }
    for (let i = 0; i < family.childGedcomIds.length; i++) {
      if (family.childGedcomIds[i] != undefined) {
        const person = await genea.Person.where({
          treeId: treeId,
          gedcomId: family.childGedcomIds[i],
        }).first();

        if (person != null) {
          console.log("CHILD CHILDLINK IS CREATING");
          const childLink = await genea.ChildLink.create({
            personId: person?.id,
            gedcomId: family.childGedcomIds[i],
            partnershipId: partnershipId,
          });
        }
      }
    }
  }

  export function dateOrNull(value?: string): Date | null {
    if (!value) return null;

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return null;
    return date;
  }
}

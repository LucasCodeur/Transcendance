import { db } from "./client.ts";

import type { Person, Family } from "#lib/schemas/gedcom/gedcomSchemas.ts";

export namespace geneaDB {
  export const genea = db.orm.genealogy;

  export async function addToDB(
    persons: Person,
    family: Family,
    treeId: String,
  ) {
    for (let person of persons) {
      await addPerson(person, treeId);
    }

    let partnerShip = await genea.Partnership.where({
      gedcomId: family.gedcomId,
      treeId: treeId,
    }).first();

    if (partnerShip == null) {
      partnerShip = await genea.Partnership.create({
        gedcomId: family.gedcomId,
        treeId: treeId,
      });
    }

    await addRelations(family, treeId, partnerShip.id);

    return {
      success: true,
      data: undefined,
    };
  }

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
        const partnerLink = await genea.PartnerLink.create({
          personId: person?.id,
          gedcomId: family.husdbandGedcomId,
          partnershipId: partnershipId,
          type: "HUSB",
        });
      }
    }
    if (family.wifeGedcomId != undefined) {
      const person = await genea.Person.where({
        treeId: treeId,
        gedcomId: family.wifeGedcomId,
      }).first();
      if (person != null) {
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

  export async function getTreeFromDb(treeId: String) {
    const tree = await genea.Tree.select("name")
      .include("persons", (persons) =>
        persons
          .select(
            "id",
            "gedcomId",
            "givenName",
            "surName",
            "fullName",
            "gender",
            "birthDate",
            "birthPlace",
            "birthAdress",
            "deceased",
            "deathDate",
            "deathPlace",
          )
          .include("partnerLinks", (partnerLinks) =>
            partnerLinks.select(
              "id",
              "personId",
              "partnershipId",
              "gedcomId",
              "type",
            ),
          )
          .include("childLinks", (childLinks) =>
            childLinks.select("id", "personId", "partnershipId", "gedcomId"),
          ),
      )
      .first();
    return tree;
  }

  export async function getPersonFromDb(person) {
    let res: Person = {
      gedcomId: "",
      birth: {},
      death: {},
      burial: {},
      familyAsSpouseIds: [],
      familyAsChildIds: [],
      occupations: [],
      education: [],
      notes: [],
      objectIds: [],
    };
    res.gedcomId = person.gedcomId;
    res.fullname = person.fullName;
    res.surname = person.surName;
    res.givenname = person.givenName;

    res.birth.date = person.birthDate;
    res.birth.place = person.birthPlace;
    res.birth.address = person.birthAdress;

    res.death.address = person.deathDate;
    res.death.place = person.deathDate;
    return res;
  }
}

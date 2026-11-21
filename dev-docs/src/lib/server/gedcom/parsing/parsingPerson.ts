import { utilsGedcom } from "#lib/server/gedcom/utilsGedcom";
import { db } from "#prisma/db.ts";
import { personSchema } from "#lib/schemas/gedcom/gedcomSchemas.ts";

import type { Person } from "#lib/schemas/gedcom/gedcomSchemas.ts";
import type { ASTNode } from "@domorium/validator";

let genea = db.orm.genealogy;

// TODO: to conform with my prisma schema.
// 0 @I1@ INDI
// 1 NAME Jean /Dupont/
// 2 GIVN Jean
// 2 SURN Dupont
// 1 SEX M
// 1 BIRT
// 2 DATE 10 JAN 1980
// 2 PLAC Paris, France
// 1 FAMS @F1@

export async function parseSubmitter(node: ASTNode) {
  let surname: string = "";
  for (let record of node.children) {
    let value = record.tokens?.VALUE?.value;
    let tag = record.tokens?.TAG?.value;
    if (tag === "NAME") {
      let parts: string[] = value.split(" ");
      surname = parts[1];
      break;
    }
  }
  const name: string = surname + " Family";
  const tree = await genea.Tree.create({
    name: name,
  });

  return tree.id;
}

export function parseIndividual(node: ASTNode): Person {
  let person: Person = {
    gedcomId: node.tokens.POINTER?.value,
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

  parsePerson(node.children, person);

  return person;
}

/**
 * @brief Parses information about a person. A person is an individual with information such as first name, last name, birthday, etc.
 * @param
 * @param
 * @return
 */
function parsePerson(nodes: ASTNode[], person: Person) {
  for (let node of nodes) {
    let value = node.tokens?.VALUE?.value;
    let tag = node.tokens?.TAG?.value;

    switch (tag) {
      case "NAME":
        parseName(node, person);
        break;
      case "SEX":
        person.gender = value;
        break;
      case "BIRT":
        parseEvent(node.children ?? [], person, "birth");
        break;
      case "DEAT":
        parseEvent(node.children ?? [], person, "death");
        break;
      case "BURI":
        parseEvent(node.children ?? [], person, "burial");
        break;
      case "FAMS":
        if (node.tokens?.XREF?.value) {
          if (person.familyAsSpouseIds == null) person.familyAsSpouseIds = [];
          person.familyAsSpouseIds.push(node.tokens.XREF.value);
        }
        break;
      case "FAMC":
        if (node.tokens?.XREF?.value) {
          if (person.familyAsSpouseIds == null) person.familyAsChildIds = [];
          person.familyAsChildIds?.push(node.tokens.XREF.value);
        }
        break;
    }
  }
}

function parseName(nodeName: ASTNode, person: Person) {
  const fullName = nodeName.tokens?.VALUE?.value.replaceAll("/", "");
  if (fullName) {
    person.fullname = fullName;
  }

  const children = nodeName.children ?? [];

  for (const node of children) {
    const tag = node.tokens?.TAG?.value;
    const value = node.tokens?.VALUE?.value;

    if (!value) continue;

    if (tag === "GIVN") {
      person.givenname = value;
    } else if (tag === "SURN") {
      person.surname = value;
    } else if (tag === "NICK") {
      person.nickname = value;
    }

    if ((!person.givenname || !person.surname) && fullName) {
      let parts: string[] = fullName.split(" ");
      person.givenname = parts[0];
      person.surname = parts[1];
    }
  }
}

type Event = {
  date?: string;
  place?: string;
  address?: string;
};

function parseEvent(
  nodes: ASTNode[],
  person: Person,
  eventType: "birth" | "death" | "burial",
) {
  const event: Event = {};

  for (const node of nodes) {
    const tag = node.tokens?.TAG?.value;
    const value = node.tokens?.VALUE?.value;

    if (!value) continue;

    if (tag === "DATE") {
      event.date = utilsGedcom.formatDate(value);
    } else if (tag === "PLAC") {
      event.place = value;
    } else if (tag === "ADDR") {
      event.address = value;
    }
  }

  if (eventType === "birth") {
    person.birth.date = event.date;
    person.birth.place = event.place;
    person.birth.address = event.address;
  } else if (eventType === "death") {
    person.death.date = event.date;
    person.death.place = event.place;
    person.death.address = event.address;
  } else if (eventType === "burial") {
    person.burial.date = event.date;
    person.burial.place = event.place;
    person.burial.address = event.address;
  }
}

export function validateIndividual(persons: Person[], person: Person) {
  const validPerson = personSchema.safeParse(person);
  if (!validPerson.success)
    return validPerson.error.issues.map((issue) => issue.message);

  persons.push(validPerson.data);
}

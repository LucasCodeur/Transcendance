import { GedcomDocument } from "@domorium/validator";
import { db } from "#prisma/db.ts";

import type { ASTNode } from "@domorium/validator";
import type { Person } from "#lib/schemas/gedcom/gedcomSchemas.ts";

export const genea = db.orm.genealogy;
export namespace utilsGedcom {
  const MONTHS: Record<string, string> = {
    JAN: "01",
    FEB: "02",
    MAR: "03",
    APR: "04",
    MAY: "05",
    JUN: "06",
    JUL: "07",
    AUG: "08",
    SEP: "09",
    OCT: "10",
    NOV: "11",
    DEC: "12",
  };

  export function formatDate(date: string): string {
    let newDate: string = "";
    let parts: string[] = date.split(" ");
    let month: string = MONTHS[parts[1]];
    newDate = parts[2] + "-" + month + "-" + parts[0];
    return newDate;
  }

  export function printGedcomTree(document: GedcomDocument) {
    for (const record of document.getNodes()) {
      printNode(record);
    }
  }

  export function printNode(node: ASTNode) {
    const tag: string | undefined = getTag(node);
    const value: string | undefined = getValue(node);
    const level: string | undefined = getLevel(node);
    const xref: string | undefined = getXref(node);
    const pointer: string | undefined = getPointer(node);
    console.log(
      "---------------------------------------------------------------------",
    );
    console.log("TAG: ", tag);
    console.log("VALUE:", value);
    console.log("LEVEL:", level);
    console.log("XREF:", xref);
    console.log("POINTER:", pointer);
    console.log(
      "---------------------------------------------------------------------",
    );
    let i = 0;
    while (1) {
      const nodeChildren: ASTNode | undefined = getNode(node, i);
      if (nodeChildren) printNode(nodeChildren);
      else break;
      i++;
    }
  }

  export function getPointer(node: ASTNode): string | undefined {
    return node.tokens.POINTER?.value;
  }

  export function getNode(node: ASTNode, i: number): ASTNode | undefined {
    return node.children[i];
  }

  export function getTag(node: ASTNode): string | undefined {
    return node.tokens?.TAG?.value;
  }

  export function getValue(node: ASTNode): string | undefined {
    return node.tokens?.VALUE?.value;
  }

  export function getLevel(node: ASTNode): string | undefined {
    return node.tokens?.LEVEL?.value;
  }

  export function getXref(node: ASTNode): string | undefined {
    return node.tokens.XREF?.value;
  }

  export async function printTree(tree: Tree) {
    console.log("================================");
    console.log("Family tree: ", tree.name);
    console.log("================================");

    const persons = tree.persons ?? [];

    console.log("Number of persons: ", persons.length);

    for (const person of persons) {
      await printPerson(person, tree.id);
    }
  }

  export async function printPerson(person: Person, treeId: String) {
    console.log("--------------------------------");
    console.log("Person");
    console.log("--------------------------------");

    console.log("Id: ", person.gedcomId);

    console.log("Gender: ", person.gender);

    console.log("Full name: ", person.fullName);
    console.log("Given name: ", person.givenName);
    console.log("Surname: ", person.surName);
    console.log("Nickname: ", person.nickName);
    console.log("Married name: ", person.marriedName);

    console.log("Birth date: ", person.birthDate);
    console.log("Birth place: ", person.birthPlace);
    console.log("Birth address: ", person.birthAdress);

    console.log("Dead: ", person.deceased === true ? "Yes" : "No");

    console.log("Death date: ", person.deathDate);
    console.log("Death place: ", person.deathPlace);

    const record = await genea.Person.where({
      treeId: treeId,
      gedcomId: person.gedcomId,
      fullName: person.fullname,
      givenName: person.givenname,
      surName: person.surname,
    })
      .select("id")
      .first();

    console.log("Partner relations: ");
    await printRelations(record.id, person.partnerLinks ?? []);

    console.log("Child relations: ");
    await printChildRelations(record.id, person.childLinks ?? []);
  }

  export async function printRelations(
    personId: String,
    partnerLinks: PartnerLink[],
  ) {
    for (const partnerLink of partnerLinks) {
      console.log("--------------------------------");
      console.log("Partnership");
      console.log("--------------------------------");

      console.log("Partnership id: ", partnerLink.partnershipId);
      console.log("Relation type: ", partnerLink.type);

      const partnership = await genea.Partnership.where({
        id: partnerLink.partnershipId,
      })
        .include("partnerLinks", (partnerLinks) =>
          partnerLinks.select("personId", "type"),
        )
        .include("childLinks", (childLinks) => childLinks.select("personId"))
        .first();

      if (!partnership) {
        console.log("Partnership not found");
        continue;
      }

      for (let link of partnership.partnerLinks) {
        const partner = await genea.Person.where({
          id: link.personId,
        }).first();

        if (partner && link.personId != personId) {
          console.log("Partner: ", partner.givenName, partner.surName);
        }
      }

      for (let link of partnership.childLinks) {
        const child = await genea.Person.where({
          id: link.personId,
        }).first();

        if (child) {
          console.log("Child: ", child.givenName, child.surName);
        }
      }
    }
  }

  export async function printChildRelations(
    personId: Person,
    childLinks: ChildLink[],
  ) {
    for (const childLink of childLinks) {
      const child = await genea.Person.where({
        id: childLink.personId,
      }).first();

      if (child && child.id != personId) {
        console.log("Child: ", child.givenName, child.surName);
      }
    }
  }
}

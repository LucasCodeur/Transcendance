import { GedcomDocument } from "@domorium/validator";
import {
  parseIndividual,
  parseSubmitter,
  validateIndividual,
} from "#lib/server/gedcom/parsing/parsingPerson.ts";

import { geneaDB } from "#lib/server/db/gedcom.ts";
import { db } from "#prisma";
import { utilsGedcom } from "#lib/server/gedcom/utilsGedcom.ts";
import { familySchema } from "#lib/schemas/gedcom/gedcomSchemas.ts";

import type { Person, Family } from "#lib/schemas/gedcom/gedcomSchemas.ts";
import type { ASTNode, GedcomError } from "@domorium/validator";
import type { ImportResult } from "#lib/../routes/import/+page.server.ts";

let genea = db.orm.genealogy;

export async function importGedcomFile(
  gedcomFile: FormDataEntryValue | null,
): ImportResult {
  const gedcomString: string | null = await gedcomFile.text();

  if (gedcomString && gedcomString?.length > 0) {
    const document: GedcomDocument = new GedcomDocument().createDocument(
      gedcomString,
    );

    const gedcomErrors: string[] | undefined = validateGedcomFile(document);
    if (gedcomErrors.length > 0) {
      return {
        success: false,
        kind: "input",
        errors: [
          {
            code: "ERRORS GEDCOM FILE",
            message: gedcomErrors,
          },
        ],
      };
    } else {
      const res: ImportResult = parseAST(document.getNodes());
      if (!res.success) return res;
    }
  }
}

async function parseAST(nodes: ASTNode[]) {
  let res;
  let i = 0;
  let max = nodes.length;
  let treeId: string = "";

  let persons: Person[] = [];

  const family: Family = {
    gedcomId: "",
    husdbandGedcomId: undefined,
    wifeGedcomId: undefined,
    childGedcomIds: [],
    marriage: undefined,
    divorce: undefined,
    sourceIds: [],
    notes: [],
  };

  while (i < max) {
    let tag = nodes[i].tokens.TAG?.value;
    // let value = nodes[i].tokens.VALUE?.value;
    switch (tag) {
      default:
        if (res != undefined && !res.success) return res;
      case "SUBM":
        res = await parseSubmitter(nodes[i]);
        break;
      case "INDI":
        res = parseIndividual(nodes[i], persons);
        break;
      case "FAM":
        res = await parseFamily(nodes[i], family);
        break;
    }
    if (res && !res.success) return res;
    i++;
  }
  res = await geneaDB.addToDB(persons, family, res.data);
  await testDbToZod(persons);
  utilsGedcom.printTrees();
  // await geneaDB.getTreeFromDb();
}

// type Tree
// {
//   Person[]: PersonSchema
//   Family[] : Family
// }
// export getTree(treeId: string)
// {
//
// }

async function testDbToZod(persons: Person[]) {
  const person = await genea.Person.where({
    fullName: persons[0].fullname,
  }).first();

  let zodPerson = await geneaDB.getPersonFromDb(person);
  console.log("ZOD PERSON: ", zodPerson);
}

async function parseFamily(node: ASTNode, family: Family) {
  let nodes: ASTNode[] = node.children;

  family.gedcomId = node.tokens.POINTER?.value;

  for (let node of nodes) {
    let value = node.tokens.XREF?.value;
    let tag = node.tokens?.TAG?.value;

    if (tag === "HUSB") family.husdbandGedcomId = value;
    else if (tag === "WIFE") family.wifeGedcomId = value;
    else if (tag === "CHIL") {
      family.childGedcomIds.push(value);
    }
  }
  let errors: String = validateFamily(family);
  if (errors != undefined && errors.length > 0) {
    return {
      success: false,
      kind: "Problem in relation",
      errors: [
        {
          code: "ERRORS_RELATIONS",
          message: errors,
        },
      ],
    };
  }
}

function validateFamily(family: Family) {
  const validFamily = familySchema.safeParse(family);
  if (!validFamily.success)
    return validFamily.error.issues.map((issue) => issue.message);
}

function validateGedcomFile(document: GedcomDocument): string[] {
  const errors: GedcomError[] = document.getErrors();

  const filesErrors = errors
    .filter((error) => error.level === "error")
    .map(
      (error) =>
        `Problem inside fill: ${error.message}` +
        ` begin line: ` +
        `${JSON.stringify(error.range.start)}` +
        ` finish line: ` +
        `${JSON.stringify(error.range.end)}`,
    );

  return filesErrors;
}

// ----------------------------------------------------------------------------------------------------------------------------------- //
// WARN: Figure out whether I need this information if yes:
// TODO: to conform with my prisma schema.
// 0 HEAD
// 1 SOUR SIMPLE-APP
// 2 NAME Simple GEDCOM Test
// 2 VERS 1.0
// 1 GEDC
// 2 VERS 5.5.1
// 2 FORM LINEAGE-LINKED
// 1 CHAR UTF-8
// 1 SUBM @U1@
/**
 * @brief Parses general information about a GEDCOM file.
 * @param
 * @param
 * @return
 */
// parseHeader()
// ----------------------------------------------------------------------------------------------------------------------------------- //

// TODO: to conform with my prisma schema.
// 0 @F1@ FAM // POINTER //WARN: Maybe to save inside db.
// 1 HUSB @I1@ // conjoint 1
// 1 WIFE @I2@ // conjoin 2
// 1 CHIL @I3@ // children
// 1 MARR // mariage
// 2 DATE 12 JUL 2005 // marriage date
// 2 PLAC Paris, France // marriage place
/**
 * @brief Parses information about a family and its relations. A family records relations and individuals.
 * @param
 * @param
 * @return
 *
 */
// parseFamily()

// ----------------------------------------------------------------------------------------------------------------------------------- //

// TODO: to conform with my prisma schema.
// 0 @S1@ SOUR // GEDCOM IDs source
// 1 TITL Registre des naissances de Paris // full title's source
// 1 ABBR Naissances Paris // Short version of the title. (Abrevation)
// 1 AUTH Archives de Paris // Identifies the author, organization, or authority responsible for the source.
// 1 REPO @R1@a // Indicate where the source is kept.
// 2 CALN COTE-1234 // references that indicate where to find the source physically inside the depot.
// DATA complementary infomration about the source.
// PAGE usually used when a source is linked at an accurate information.
// TEXT excerpt from a document
// NOTE add a remark about a the source

/**
 * @brief Parses information about a source. A source says where information comes from.
 * @param
 * @param
 * @return
 *
 */
// parseSource()

// ----------------------------------------------------------------------------------------------------------------------------------- //

// TODO: to conform with my prisma schema.
// 0 @R1@ REPO
// 1 NAME Archives de Paris
// 1 ADDR 18 Boulevard Sérurier
// 2 ADR1 18 Boulevard Sérurier
// 2 CITY Paris
// 2 STAE Île-de-France
// 2 POST 75019
// 2 CTRY France
// 1 PHON +33 1 53 72 41 23
// 1 WWW https://archives.paris.fr

//NOTE:
//  NAME  Nom du dépôt
//  ADDR  Adresse complète
//  ADR1  Première ligne de l’adresse
//  ADR2  Deuxième ligne de l’adresse
//  CITY  Ville
//  STAE  État, région ou département
//  POST  Code postal
//  CTRY  Pays
//  PHON  Téléphone
//  EMAIL  Adresse électronique
//  WWW  Site internet
//  NOTE  Remarque
//  DATA  Informations complémentaires

/**
 * @brief REPO refers to the repository where a source is stored: archives, library, city hall, court, etc.
 * @param
 * @param
 * @return
 *
 */
// parseRepository()

// ----------------------------------------------------------------------------------------------------------------------------------- //

// TODO: to conform with my prisma schema.
// 0 @U1@ SUBM
// 1 NAME Test User
// 1 ADDR 1 Test Street
// 2 CITY Paris
// 2 CTRY France
// 1 PHON +33 6 12 34 56 78
// 1 EMAIL test@example.com

// NOTE:
//  NAME  Nom du déclarant ou de l’organisme
//  ADDR  Adresse
//  ADR1  Première ligne de l’adresse
//  ADR2  Deuxième ligne de l’adresse
//  CITY  Ville
//  STAE  Région ou État
//  POST  Code postal
//  CTRY  Pays
//  PHON  Téléphone
//  EMAIL  Adresse électronique
//  FAX  Numéro de fax
//  LANG  Langue
//  NOTE  Remarque

// ----------------------------------------------------------------------------------------------------------------------------------- //
//
/**
 * @brief SUBM the person or organization that created or transmitted the file. Normally you find SUBM in HEAD.
 * @param
 * @param
 * @return
 *
 */
// parseSubmitter()

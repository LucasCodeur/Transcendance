import { GedcomDocument } from "@domorium/validator";

import { utilsGedcom } from "#lib/server/gedcom/utilsGedcom";

import type { GedcomError } from "@domorium/validator";
import type { Person } from "#lib/schemas/gedcom/gedcomSchemas.ts";
import type { ASTNode } from "@domorium/validator";

export async function importGedcomFile(gedcomFile: FormDataEntryValue | null) {
  const gedcomString: string | null = await gedcomFile.text();
  if (gedcomString && gedcomString?.length > 0) {
    const document: GedcomDocument = new GedcomDocument().createDocument(
      gedcomString,
    );
    const gedcomErrors: string[] | undefined = validateGedcomFile(document);
    if (gedcomErrors.length > 0) {
      return gedcomErrors;
    } else {
      utilsGedcom.printGedcomTree(document);
      addASTGedcomToDb(document);
    }
  }
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

// 0 @I1@ INDI
// 1 NAME Jean /Dupont/
// 2 GIVN Jean
// 2 SURN Dupont
// 1 SEX M
// 1 BIRT
// 2 DATE 10 JAN 1980
// 2 PLAC Paris, France
// 1 FAMS @F1@

function addASTGedcomToDb(document: GedcomDocument) {
  // Build all differents array needed.
  // Parse all informations
  // for (const record of document.getNodes()) {
  //   utilsGedcom.printNode(record);
  // }
  // check all informations with zod schema if errors -> warn client
  // Add all relations array relations
  // ADD all person inside db
  // ADD all relations inside db
  let persons: Person[] = [];
  parseAST(document.getNodes(), persons);
  console.log("PERSON: ", persons);
}

function parseAST(nodes: ASTNode[], persons: Person[]) {
  let i = 0;
  let max = nodes.length;
  while (i < max) {
    if (nodes[i].tokens.TAG?.value === "INDI") {
      let person: Person = {};
      // console.log("PARSE AST : nodes[i]", nodes[i]);
      parsePerson(nodes[i].children, person);
      console.log("PARSEAST person: ", person);
      persons.push(person);
    }
    i++;
  }
}

// function addPersons(node: ASTNode) {
//   const tag: string | undefined = getTag(node);
//   const value: string | undefined = getValue(node);
//   const level: string | undefined = getLevel(node);
//   const xref: string | undefined = getXref(node);
//   const pointer: string | undefined = getPointer(node);
// }

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
// 0 @I1@ INDI
// 1 NAME Jean /Dupont/
// 2 GIVN Jean
// 2 SURN Dupont
// 1 SEX M
// 1 BIRT
// 2 DATE 10 JAN 1980
// 2 PLAC Paris, France
// 1 FAMS @F1@

// NOTE:
//  NAME  Nom complet
//  GIVN  Prénom
//  SURN  Nom de famille
//  SEX   Sexe
//  BIRT  Naissance
//  DEAT  Décès
//  BURI  Enterrement
//  RESI  Résidence
//  OCCU  Profession
//  EDUC  Éducation
//  RELI  Religion
//  NATI  Nationalité
//  FAMS  Famille comme conjoint
//  FAMC  Famille comme enfant
//  ADOP  Adoption
//  NOTE  Note
//  SOUR  Source
//  OBJE  Objet ou média

/**
 * @brief Parses information about a person. A person is an individual with information such as first name, last name, birthday, etc.
 * @param
 * @param
 * @return
 */
function parsePerson(nodes: ASTNode[], person: Person) {
  for (let node of nodes) {
    let value: string | undefined = node.tokens?.VALUE?.value;
    let tag: string | undefined = node.tokens?.TAG?.value;

    if (tag === "NAME") {
      parseName(node.children, person);
    } else if (node.tokens?.TAG?.value[0] === "@") person.gedcomId = value;
    else if (
      node.tokens?.TAG?.value === "SEX M" ||
      node.tokens?.TAG?.value === "SEX F"
    )
      parseGender(node, person);
    else if (node.tokens?.TAG?.value === "BIRT")
      parseBirth(node.children, person);
  }
}

// 1 BIRT
// 2 DATE 10 JAN 1980
// 2 PLAC Paris, France
function parseBirth(nodes: ASTNode[], person: Person) {
  for (let node of nodes) {
    let value: string | undefined = node.tokens?.VALUE?.value;
    let tag: string | undefined = node.tokens?.TAG?.value;
    if (tag === "DATE")
      person.birthDate = new Date(utilsGedcom.formatDate(value));
    else if (tag === "PLAC") person.birthPlace = value;
  }
}

// 1 SEX M
function parseGender(node: ASTNode, person: Person) {
  let tag: string | undefined = node.tokens?.TAG?.value;
  if (tag === "SEX M") person.gender = "M";
  else if (tag === "SEX F") person.gender = "F";
}

function parseName(nodes: ASTNode[], person: Person) {
  for (let node of nodes) {
    if (node.tokens?.TAG?.value === "GIVN")
      person.givenName = node.tokens?.VALUE?.value;
    else if (node.tokens?.TAG?.value === "SURN")
      person.surName = node.tokens?.VALUE?.value;
  }
}

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

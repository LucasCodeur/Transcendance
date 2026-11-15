import { GedcomDocument, TokenNames } from "@domorium/validator";
import { fail } from "@sveltejs/kit";
import { GedcomErrorCode } from "@domorium/validator";
import { error } from "@sveltejs/kit";

import type { Actions } from "./$types";
import type { ASTNode, GedcomError } from "@domorium/validator";

export const actions: Actions = {
  upload: async ({ request }) => {
    const data: FormData = await request.formData();
    const gedcomFile = data.get("file");

    if (gedcomFile && gedcomFile.size > 0) {
      const document: GedcomDocument = new GedcomDocument().createDocument(
        await gedcomFile.text(),
      );

      const gedcomeErrors = validateGedcomFile(document);
      if (gedcomeErrors.length > 0) {
        return fail(400, {
          errors: {
            file: gedcomeErrors,
          },
        });
      }

      printGedcomTree(document);
    } else if (!(gedcomFile instanceof gedcomFile) || gedcomFile.size === 0) {
      return fail(400, { error: "Please select a gedcomFile." });
    }
    return { success: true };
  },
};

function validateGedcomFile(document: GedcomDocument) {
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

// function addASTGedcomToDb(document: GedcomDocument) {
// Build all differents array needed.
// Parse all informations
// for (const record of document.getNodes()) {
//   printNode(record);
// }
// check all informations with zod schema if errors -> warn client
// Add all relations array relations
// ADD all person inside db
// ADD all relations inside db
// }

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
//  SEX  Sexe
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
// parseInidividual()

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

async function printGedcomTree(document: GedcomDocument) {
  for (const record of document.getNodes()) {
    printNode(record);
  }
}

function printNode(node: ASTNode) {
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

function getPointer(node: ASTNode): string | undefined {
  return node.tokens.POINTER?.value;
}

function getNode(node: ASTNode, i: number): ASTNode | undefined {
  return node.children[i];
}

function getTag(node: ASTNode): string | undefined {
  return node.tokens?.TAG?.value;
}

function getValue(node: ASTNode): string | undefined {
  return node.tokens?.VALUE?.value;
}

function getLevel(node: ASTNode): string | undefined {
  return node.tokens?.LEVEL?.value;
}

function getXref(node: ASTNode): string | undefined {
  return node.tokens.XREF?.value;
}

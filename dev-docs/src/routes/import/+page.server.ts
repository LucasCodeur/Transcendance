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

async function printGedcomTree(document: GedcomDocument) {
  const payload = (node: ASTNode, tag: string): string | undefined =>
    node.children.find((child) => child.tokens[TokenNames.TAG]?.value === tag)
      ?.tokens[TokenNames.VALUE]?.value;

  for (const record of document.getNodes()) {
    // if (record.tokens[TokenNames.TAG]?.value !== "INDI") continue;
    // console.log({
    //   xref: record.tokens[TokenNames.POINTER]?.value,
    //   name: payload(record, "NAME"),
    //   line: record.range.start.line,
    // });
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

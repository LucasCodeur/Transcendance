import { GedcomDocument, TokenNames } from "@domorium/validator";
import { fail } from "@sveltejs/kit";
import { GedcomErrorCode } from "@domorium/validator";
import { error } from "@sveltejs/kit";

import type { Actions } from "./$types";
import type { ASTNode, GedcomError } from "@domorium/validator";

async function printGedcomTree(document) {
  const payload = (node: ASTNode, tag: string): string | undefined =>
    node.children.find((child) => child.tokens[TokenNames.TAG]?.value === tag)
      ?.tokens[TokenNames.VALUE]?.value;

  for (const record of document.getNodes()) {
    if (record.tokens[TokenNames.TAG]?.value !== "INDI") continue;
    console.log({
      xref: record.tokens[TokenNames.POINTER]?.value,
      name: payload(record, "NAME"),
      line: record.range.start.line,
    });
  }
}

export const actions: Actions = {
  upload: async ({ request }) => {
    const data: FormData = await request.formData();
    const file = data.get("file");

    if (file && file.size > 0) {
      const document: GedcomDocument = new GedcomDocument().createDocument(
        await file.text(),
      );
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

      // console.log("FILE: ", await file.text());
      console.log("BEFORE FOR ERRORS:", errors);
      if (filesErrors.length > 0) {
        return fail(400, {
          errors: {
            file: filesErrors,
          },
        });
      }
    } else if (!(file instanceof File) || file.size === 0) {
      return fail(400, { error: "Please select a file." });
    }
    // printGedcomTree(document);
    return { success: true };
  },
};

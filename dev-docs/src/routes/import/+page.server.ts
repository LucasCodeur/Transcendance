import { GedcomDocument, TokenNames } from "@domorium/validator";
import type { ASTNode, GedcomError } from "@domorium/validator";
import { GedcomErrorCode } from "@domorium/validator";
import { error } from "@sveltejs/kit";

export const load: import = ({ locals, url }) => {
	if (locals.user) redirect(303, '/account');
	const error = url.searchParams.get('error')

	return { oauthError: error ? (OAUTH_ERRORS[error] ?? null) : null };
};

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

export const actions = {
  upload: async ({ request }) => {
    const data: FormData = await request.formData();
    console.log("DATA:", data);
    const file = data.get("file");
    if (file && file.size > 0) {
      const document: GedcomDocument = new GedcomDocument().createDocument(
        await file.text(),
      );
      const errors: GedcomError[] = document.getErrors();

      for (let error of errors) {
        if (error.level === "error") console.log(error.message);
      }
      // await printGedcomTree(document);
    }
    return { success: true };
  },
};

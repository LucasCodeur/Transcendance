import { importGedcomFile } from "#lib/server/gedcom/parsing/parsingGedcomFile.ts";
import { fail } from "@sveltejs/kit";

import type { Actions } from "./$types";
import type { GedcomError } from "@domorium/validator";

export const actions: Actions = {
  upload: async ({ request }) => {
    const data: FormData = await request.formData();
    const gedcomFile: FormDataEntryValue | null = data.get("file");

    // if (!(gedcomFile instanceof gedcomFile) || gedcomFile.size === 0) {
    //   return fail(400, { error: "Please select a gedcomFile." });
    // }

    let gedcomErrors: string[] | undefined;
    gedcomErrors = await importGedcomFile(gedcomFile);

    if (gedcomErrors) {
      return fail(400, {
        errors: {
          file: gedcomErrors,
        },
      });
    }
    return { success: true };
  },
};

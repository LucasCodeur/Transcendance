import { importGedcomFile } from "#lib/server/gedcom/parsing/parsingGedcomFile.ts";
import { fail } from "@sveltejs/kit";

import type { Actions } from "./$types";
import type { GedcomError } from "@domorium/validator";

export type ImportError = {
  code: string;
  message: string;
  field?: string;
};

export type ImportResult<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      kind: "validation" | "input" | "database" | "unexpected";
      errors: ImportError[];
    };

export const actions: Actions = {
  upload: async ({ request }) => {
    const data: FormData = await request.formData();
    const gedcomFile: FormDataEntryValue | null = data.get("file");

    // if (!(gedcomFile instanceof gedcomFile) || gedcomFile.size === 0) {
    //   return fail(400, { error: "Please select a gedcomFile." });
    // }

    let gedcomErrors: ImportError = await importGedcomFile(gedcomFile);
    if (gedcomErrors) {
      return fail(400, {
        errors: {
          file: gedcomErrors.message,
        },
      });
    }
    return { success: true };
  },
};

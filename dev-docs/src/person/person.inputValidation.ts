import * as z from "zod";

export const personSchema = z.object({
  gender: z.literal(["Male", "Female"]), // WARN: Only Male, Female ?
  firstName: z // WARN: What's the character limit?
    .string()
    .min(1)
    .max(100)
    .regex(/[a-zA-Z']/gm),
  lastName: z // WARN: What's the character limit?
    .string()
    .min(1)
    .max(100)
    .regex(/[a-zA-Z']/gm)
    .optional(),
  middleName: z // WARN: What's the character limit?
    .string()
    .min(1)
    .max(100)
    .regex(/[a-zA-Z']/gm)
    .optional(),
  marriedName: z
    .string()
    .min(1)
    .max(100)
    .regex(/[a-zA-Z']/gm)
    .optional(),
  birthDate: z.date(),
  birthPlace: z
    .string()
    .min(1)
    .max(100)
    .regex(/[a-zA-Z]/gm),
  deceased: z.boolean(),
  deathDate: z.date().optional(),
  deathPlace: z
    .string()
    .min(1)
    .max(100)
    .regex(/[a-zA-Z]/gm)
    .optional(),
});

export type personSchema = z.infer<typeof personSchema>;

import * as z from "zod";

export const personSchema = z.object({
  gedcomId: z.string(),
  gender: z.literal(["M", "F"]).optional(), // WARN: Only Male, Female ?
  givenName: z // WARN: What's the character limit?
    .string()
    .min(1)
    .max(100)
    .regex(/[a-zA-Z']/gm)
    .optional(),
  surName: z // WARN: What's the character limit?
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
  occupation: z // WARN: What's the character limit?
    .string()
    .min(1)
    .max(100)
    .regex(/[a-zA-Z']/gm)
    .optional(),
  education: z // WARN: What's the character limit?
    .string()
    .min(1)
    .max(100)
    .regex(/[a-zA-Z']/gm)
    .optional(),
  nationality: z // WARN: What's the character limit?
    .string()
    .min(1)
    .max(100)
    .regex(/[a-zA-Z']/gm)
    .optional(),
  religion: z // WARN: What's the character limit?
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
  note: z
    .string()
    .min(1)
    .max(100)
    .regex(/[a-zA-Z]/gm)
    .optional(),
  source: z
    .string()
    .min(1)
    .max(100)
    .regex(/[a-zA-Z]/gm)
    .optional(),
  objet: z
    .string()
    .min(1)
    .max(100)
    .regex(/[a-zA-Z]/gm)
    .optional(),
});

export type personSchema = z.infer<typeof personSchema>;

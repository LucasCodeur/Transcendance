import * as z from "zod";

const optionalText = z.string().trim().min(1).max(200);

const addressSchema = z.object({
  value: optionalText,
  city: optionalText,
  state: optionalText,
  postalCode: optionalText,
  country: optionalText,
});

const sourceReferenceSchema = z.object({
  gedcomId: z.string().min(1),

  page: optionalText,
});

const eventSchema = z.object({
  date: optionalText.optional(),
  place: optionalText.optional(),
  address: addressSchema.optional(),

  note: optionalText.optional(),
  sourceIds: z.array(z.string()).default([]).optional(),
});

export const personSchema = z.object({
  gender: z.enum(["M", "F", "U"]).optional(),

  fullname: optionalText.optional(),
  givenname: optionalText.optional(),
  surname: optionalText.optional(),
  nickname: optionalText.optional(),
  marriedname: optionalText.optional(),

  birth: eventSchema.optional(),
  death: eventSchema.optional(),
  burial: eventSchema.optional(),

  occupations: z.array(optionalText).default([]),
  education: z.array(optionalText).default([]),
  nationality: optionalText.optional(),
  religion: optionalText.optional(),

  deceased: z.boolean().optional(),

  gedcomId: z.string().min(1).optional(),
  familyAsSpouseIds: z.array(z.string()).default([]).optional(),
  familyAsChildIds: z.array(z.string()).default([]).optional(),

  notes: z.array(optionalText).default([]).optional(),
  sources: z.array(sourceReferenceSchema).default([]).optional(),
  objectIds: z.array(z.string()).default([]).optional(),
});

export type Person = z.infer<typeof personSchema>;

const familyEventSchema = z.object({
  date: z.string().optional(),
  place: z.string().optional(),
  address: z.string().optional(),

  sourceIds: z.array(z.string()).default([]),
  notes: z.array(z.string()).default([]),
});

export const familySchema = z.object({
  gedcomId: z.string().min(1),

  husdbandGedcomId: z.string().optional(),
  wifeGedcomId: z.string().optional(),

  childGedcomIds: z.array(z.string()).default([]),

  marriage: familyEventSchema.optional(),
  divorce: familyEventSchema.optional(),

  sourceIds: z.array(z.string()).default([]),
  notes: z.array(z.string()).default([]),
});

export type Family = z.infer<typeof familySchema>;

export const relationSchema = z.object({
  familyGedcomId: z.string().min(1),
  personGedcomId: z.string().min(1),

  role: z.enum(["HUSB", "WIFE", "CHIL"]),
});

export type Relation = z.infer<typeof relationSchema>;

import * as z from "zod";

const optionalText = z.string().trim().min(1).max(200).optional();

const addressSchema = z.object({
  value: optionalText,
  city: optionalText,
  state: optionalText,
  postalCode: optionalText,
  country: optionalText,
});

const eventSchema = z.object({
  date: optionalText,
  place: optionalText,
  address: addressSchema.optional(),
  note: optionalText,
  sourceIds: z.array(z.string()).default([]),
});

const sourceReferenceSchema = z.object({
  gedcomId: z.string().min(1),
  page: optionalText,
});

export const personSchema = z.object({
  gedcomId: z.string().min(1),

  gender: z.enum(["M", "F", "U"]).optional(),

  givenName: optionalText,
  surName: optionalText,
  nickName: optionalText,
  marriedName: optionalText,

  birth: eventSchema.optional(),
  death: eventSchema.optional(),
  burial: eventSchema.optional(),

  occupations: z.array(optionalText).default([]),
  education: z.array(optionalText).default([]),
  nationality: optionalText,
  religion: optionalText,

  deceased: z.boolean(),

  familyAsSpouseIds: z.array(z.string()).default([]),
  familyAsChildIds: z.array(z.string()).default([]),

  notes: z.array(optionalText).default([]),
  sources: z.array(sourceReferenceSchema).default([]),
  objectIds: z.array(z.string()).default([]),
});

export type Person = z.infer<typeof personSchema>;

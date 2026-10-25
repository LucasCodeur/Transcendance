import * as z from "zod";
export const sInputPerson = z.object({
  firstName: z // WARN: What's the character limit?
    .string()
    .min(1)
    .max(100)
    .regex(/[a-zA-Z]/),
  lastName: z // WARN: What's the character limit?
    .string()
    .min(1)
    .max(100)
    .regex(/[a-zA-Z]/),
  gender: z.literal(["Male", "Female"]), // WARN: Only Male, Female ?
  birthDate: z.date(),
  birthDateEnd: z.date(),
});

export type inputPerson = z.infer<typeof sInputPerson>;

export async function createInputPerson(): inputPerson {
  const inputPerson = await sInputPerson.parse({
    firstName: "Jules",
    lastName: "Weber",
    gender: "Male",
    birthDate: new Date("2000-01-01"), //WARN: Weird behavior: if I put 2000-1-1 it works, but the date isn't the same. According to the documentation, it normally shouldn't work
    birthDateEnd: new Date("3000-01-01"), // WARN: What is the limit should I put ?
  });
  return inputPerson;
}

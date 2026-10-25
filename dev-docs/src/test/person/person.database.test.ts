import { createPerson, genea } from "../../person/person.database";

import {
  createInputPerson,
  inputPerson,
} from "../../person/person.inputValidation";

import { db } from "../../prisma/db";

export async function testCreatePerson() {
  console.log("TEST CREATE PERSON:");
  await genea.Person.deleteAll();
  const inputPerson: InputPerson = await createInputPerson();
  const person = await createPerson(inputPerson);
  console.log(person);
}

async function main() {
  await testCreatePerson();
  // await db.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

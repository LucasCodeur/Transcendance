import { createPerson, genea } from "../../person/person.database";

import { sInputPerson } from "../../person/person.inputValidation";

export async function testCreateInputPerson() {
  const inputPerson = sInputPerson.parse({
    firstName: "Jules",
    lastName: "Weber",
    gender: "Male",
    birthDate: new Date("2000-01-01"), //WARN: Weird behavior: if I put 2000-1-1 it works, but the date isn't the same. According to the documentation, it normally shouldn't work
    deceased: false,
    birthPlace: "Geneve",
  });
  return inputPerson;
}

export async function testCreatePerson() {
  console.log("TEST CREATE PERSON:");
  await genea.Person.where({}).deleteAll();
  const weberFamily = await genea.Tree.create({
    name: "The Weber family",
  });
  const inputPerson = await testCreateInputPerson();
  const person = await createPerson(inputPerson, weberFamily.id);
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

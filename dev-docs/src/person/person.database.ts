import { InputPerson } from "../test/person/person.database.test";
import { db } from "../prisma/db";

export let genea = db.orm.genealogy;

export async function createPerson(inputPerson: InputPerson) {
  const newPerson = await genea.Person.create({
    firstName: inputPerson.firstName,
    lastName: inputPerson.lastName,
    gender: inputPerson.gender,
    birthDate: new Date(inputPerson.birthDate),
    birthDateEnd: new Date(inputPerson.birthDateEnd),
  });
  return newPerson;
}

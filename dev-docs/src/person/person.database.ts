import { db } from "../prisma/db";

export let genea = db.orm.genealogy;

export async function createPerson(inputPerson: InputPerson, treeId: String) {
  const newPerson = await genea.Person.create({
    firstName: inputPerson.firstName,
    lastName: inputPerson.lastName,
    gender: inputPerson.gender,
    birthDate: new Date(inputPerson.birthDate),
    deceased: inputPerson.deceased,
    birthPlace: inputPerson.birthPlace,

    treeId: treeId,
  });
  return newPerson;
}

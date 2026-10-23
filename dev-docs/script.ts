import { db } from "./src/prisma/db";

let genea = db.orm.genealogy;

async function main() {
  const person = await genea.Person.create({
    firstName: "Jules",
    lastName: "Weber",
    Gender: "Male",
    birthDate: new Date("2000"),
    birthDateEnd: new Date("3000"),
  });

  console.log(person);

  await db.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

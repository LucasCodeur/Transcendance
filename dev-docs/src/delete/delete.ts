import { db } from "#prisma/db";

let genea = db.orm.genealogy;

export async function deleteDataDb() {
  console.log("Starting database deletion...");

  await genea.Media.deleteAll();
  await genea.ChildLink.deleteAll();
  await genea.PartnerLink.deleteAll();
  await genea.Partnership.deleteAll();
  await genea.Person.deleteAll();
  await genea.Tree.deleteAll();

  console.log("Database completely emptied.");
}

async function main() {
  await deleteDataDb();
  // await db.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

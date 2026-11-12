import fs from "fs";
import { parse, compact } from "gedcom";

function importGedcomToDb() {
  const objectGedcom = convertGedcomToObject();
  // for (let children of objectGedcom.children) {
  //   console.log("CHILDREN: ", JSON.stringify(children, null, 4));
  // }
  console.log(JSON.stringify(objectGedcom, null, 0));
}

function convertGedcomToObject() {
  const inputStr = fs.readFileSync("test.GED", "utf8");

  const parsed = parse(inputStr);
  // const compacted = compact(parsed);
  return parsed;
}

importGedcomToDb();

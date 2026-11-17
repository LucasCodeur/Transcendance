import type { ASTNode } from "@domorium/validator";
import { GedcomDocument } from "@domorium/validator";

export namespace utilsGedcom {
  const MONTHS: Record<string, string> = {
    JAN: "01",
    FEB: "02",
    MAR: "03",
    APR: "04",
    MAY: "05",
    JUN: "06",
    JUL: "07",
    AUG: "08",
    SEP: "09",
    OCT: "10",
    NOV: "11",
    DEC: "12",
  };

  export function formatDate(date: string): string {
    let newDate: string = "";
    let parts: string[] = date.split(" ");
    let month: string = MONTHS[parts[1]];
    newDate = parts[2] + "-" + month + "-" + parts[0];
    return newDate;
  }

  export function printGedcomTree(document: GedcomDocument) {
    for (const record of document.getNodes()) {
      printNode(record);
    }
  }

  export function printNode(node: ASTNode) {
    const tag: string | undefined = getTag(node);
    const value: string | undefined = getValue(node);
    const level: string | undefined = getLevel(node);
    const xref: string | undefined = getXref(node);
    const pointer: string | undefined = getPointer(node);
    console.log(
      "---------------------------------------------------------------------",
    );
    console.log("TAG: ", tag);
    console.log("VALUE:", value);
    console.log("LEVEL:", level);
    console.log("XREF:", xref);
    console.log("POINTER:", pointer);
    console.log(
      "---------------------------------------------------------------------",
    );
    let i = 0;
    while (1) {
      const nodeChildren: ASTNode | undefined = getNode(node, i);
      if (nodeChildren) printNode(nodeChildren);
      else break;
      i++;
    }
  }

  export function getPointer(node: ASTNode): string | undefined {
    return node.tokens.POINTER?.value;
  }

  export function getNode(node: ASTNode, i: number): ASTNode | undefined {
    return node.children[i];
  }

  export function getTag(node: ASTNode): string | undefined {
    return node.tokens?.TAG?.value;
  }

  export function getValue(node: ASTNode): string | undefined {
    return node.tokens?.VALUE?.value;
  }

  export function getLevel(node: ASTNode): string | undefined {
    return node.tokens?.LEVEL?.value;
  }

  export function getXref(node: ASTNode): string | undefined {
    return node.tokens.XREF?.value;
  }
}

import type { ASTNode } from "@domorium/validator";
import { GedcomDocument } from "@domorium/validator";

export namespace utilsGedcom {
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

function printGedcomTree(document: GedcomDocument) {
  for (const record of document.getNodes()) {
    printNode(record);
  }
}

function printNode(node: ASTNode) {
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

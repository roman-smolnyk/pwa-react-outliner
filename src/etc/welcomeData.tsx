import { TreeRoAPI } from "../api";

export function createWelcomeDocument() {
  const rootGroupId = TreeRoAPI.getRootGroupId();
  const documentId = TreeRoAPI.insertNewDocument(rootGroupId, "# Welcome to the TreeRo")!;

  const ydocument = TreeRoAPI.Yjs.YDocumentWrap.get(documentId)!;

  for (const arr of data) {
    TreeRoAPI.insertNewNode(ydocument.root_node_id, arr[arr.length - 1] as string);
  }

  TreeRoAPI.uiOpenNode(ydocument.root_node_id);
}

const data = [["**TreeRo** is markdown based outliner"], [true, "Reliable"]];

import { TreeRoAPI } from "../api";

export function createWelcomeDocument() {
  const rootGroupId = TreeRoAPI.getRootGroupId();
  const documentId = TreeRoAPI.insertNewDocument(rootGroupId, "# Welcome to the TreeRo")!;
  TreeRoAPI.LocalConfig.set({ currentDocumentId: documentId });

  const ydocument = TreeRoAPI.Yjs.YDocumentWrap.get(documentId)!;
  TreeRoAPI.LocalConfig.set({ currentNodeId: ydocument.root_node_id });

  for (const arr of data) {
    TreeRoAPI.insertNewNode(ydocument.root_node_id, arr[arr.length - 1] as string);
  }
}

const data = [["**TreeRo** is markdown based outliner"], [true, "Reliable"]];

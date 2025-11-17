import { useStore } from "./stateStore";
import type { DocumentDataType, GroupDataType, NodeDataType, TreeRoAPIType, DocumentWithNodesDataType } from "./types";

import { DB } from "./db";

export class DataNotLoadedError extends Error {}

export const TreeRoAPI: TreeRoAPIType = {
  useStore: useStore, // expose to userscript
  changesQueue: [],
  dataIsLoaded: false,

  // Async method to load initial data
  async loadInitialData() {
    // await DB.resetDb();
    let currentDocId = await DB.loadCurrentDocumentId();
    let rootGroupId = await DB.loadRootGroupId();
    const groups = await DB.loadGroups();
    const documents = await DB.loadDocuments();
    const nodes = await DB.loadNodes();

    if (!rootGroupId) {
      const newRootNode = TreeRoAPI.createNode("Untitled");
      const newDocument = TreeRoAPI.createDocument(newRootNode.node_id);
      const newRootGroup = TreeRoAPI.createGroup("Root Group");
      newRootGroup.children.push(newDocument.document_id);
      currentDocId = newDocument.document_id;
      rootGroupId = newRootGroup.group_id;

      nodes.push(newRootNode);
      documents.push(newDocument);
      groups.push(newRootGroup);

      await DB.saveNode(newRootNode);
      await DB.saveDocument(newDocument);
      await DB.saveGroup(newRootGroup);
      await DB.saveRootGroupId(rootGroupId);
      await DB.saveCurrentDocumentId(currentDocId);

      // Temp
      const newNode = TreeRoAPI.createNode("Sample Text");
      newRootNode.children.push(newNode.node_id);
      nodes.push(newNode);
      await DB.saveNode(newNode);
    }

    useStore.setState({
      stateIsInitialized: true,
      currentDocId: currentDocId || "",
      rootGroupId: rootGroupId,
      groups: new Map(groups.map((g) => [g.group_id, g])),
      documents: new Map(documents.map((d) => [d.document_id, d])),
      nodes: new Map(nodes.map((n) => [n.node_id, n])),
    });
  },

  // updateStateFromStructure(structure) {
  //   const groups = useStore.getState().groups;
  //   const documents = useStore.getState().documents;

  //   structure.groups.forEach((group) => {
  //     groups.set(group.group_id, group);
  //     group.children.forEach((id) => {
  //       const g = structure.groups.find((a) => a.group_id === id);
  //       if (g) {
  //         groups.set(id, g);
  //       } else {
  //         const d = structure.documents.find((a) => a.document_id === id);
  //         if (d) documents.set(id, d);
  //       }
  //     });
  //   });

  //   useStore.setState({
  //     currentDocId: structure.current_document_id,
  //     rootGroupId: structure.root_group_id,
  //     groups: new Map(groups),
  //     documents: new Map(documents),
  //   });
  // },

  // updateStateFromDoc(doc) {
  //   const nodes = useStore.getState().nodes;
  //   doc.nodes.forEach((n) => {
  //     nodes.set(n.node_id, n);
  //   });
  //   useStore.setState({ nodes: new Map(nodes) });
  // },

  getCurrentDocId() {
    return useStore.getState().currentDocId;
  },

  setCurrentDocId(docId) {
    useStore.setState({ currentDocId: docId });
  },

  getRootGroupId() {
    return useStore.getState().rootGroupId;
  },

  setRootGroupId(groupId) {
    useStore.setState({ rootGroupId: groupId });
  },

  listGroups() {
    return () => Array.from(useStore.getState().groups.values());
  },

  createGroup(name = "New Group", collapsed = false) {
    const newGroup: GroupDataType = {
      group_id: crypto.randomUUID(),
      name: name,
      collapsed: collapsed,
      children: [],
    };
    return newGroup;
  },

  insertGroup(group, parentGroupId, index = -1) {
    useStore.getState().insertGroup(group, parentGroupId, index);
  },

  updateGroup(groupId, newGroupData) {
    useStore.getState().updateGroup(groupId, newGroupData);
  },

  getGroupChildren(groupId) {
    return useStore.getState().getGroupChildren(groupId);
  },

  moveGroup(groupId, parentGroupId, index) {
    useStore.getState().moveGroup(groupId, parentGroupId, index);
  },

  deleteGroup(groupId) {
    useStore.getState().deleteGroup(groupId);
  },

  listDocuments() {
    return () => Array.from(useStore.getState().documents.values());
  },

  getDocumentRootNodeId(docId) {
    return useStore.getState().getDocumentRootNodeId(docId);
  },

  createDocument(rootNodeId) {
    const newDoc: DocumentDataType = {
      document_id: crypto.randomUUID(),
      root_node_id: rootNodeId,
    };
    return newDoc;
  },

  insertDocument(document, parentGroupId, index = -1) {
    useStore.getState().insertDocument(document, parentGroupId, index);
  },

  updateDocument(docId, newDocData) {
    useStore.getState().updateDocument(docId, newDocData);
  },

  getDocumentNodes(docId) {
    return useStore.getState().getDocumentNodes(docId);
  },

  moveDocument(docId, parentGroupId, index) {
    useStore.getState().moveDocument(docId, parentGroupId, index);
  },

  deleteDocument(docId) {
    useStore.getState().deleteDocument(docId);
  },

  openDocument(docId) {
    useStore.setState({ currentDocId: docId });
  },

  listNodes(docId) {
    if (docId) return useStore.getState().getDocumentNodes(docId);
    return Array.from(useStore.getState().nodes.values());
  },

  createNode(content = "", collapsed = false, args = {}) {
    const newNode: NodeDataType = {
      node_id: crypto.randomUUID(),
      content,
      collapsed,
      created: Date.now(),
      modified: Date.now(),
      children: [],
      ...args,
    };
    return newNode;
  },

  insertNode(node, parentNodeId, index = -1) {
    useStore.getState().insertNode(node, parentNodeId, index);
  },

  insertNodeAfter(node, siblingNodeId) {
    useStore.getState().insertNodeAfter(node, siblingNodeId);
  },

  insertNodeBefore(node, siblingNodeId) {
    useStore.getState().insertNodeBefore(node, siblingNodeId);
  },

  updateNode(nodeId, newNodeData) {
    useStore.getState().updateNode(nodeId, { modified: Date.now(), ...newNodeData });
    const node = useStore.getState().nodes.get(nodeId);
    if (!node) return;
    DB.saveNode(node);
  },

  getNodeChildren(nodeId) {
    return useStore.getState().getNodeChildren(nodeId);
  },

  getNodeParent(nodeId) {
    return useStore.getState().getNodeParent(nodeId);
  },

  moveNode(nodeId, parentNodeId, index) {
    useStore.getState().moveNode(nodeId, parentNodeId, index);
  },

  moveNodeAfter(nodeId, siblingNodeId) {
    useStore.getState().moveNodeAfter(nodeId, siblingNodeId);
  },

  moveNodeBefore(nodeId, siblingNodeId) {
    useStore.getState().moveNodeBefore(nodeId, siblingNodeId);
  },

  deleteNode(nodeId) {
    useStore.getState().deleteNode(nodeId);
  },

  queryNodesByText(text, docId) {
    return useStore.getState().queryNodesByText(text, docId);
  },

  toggleNodeCollapse(nodeId) {
    const node = useStore.getState().nodes.get(nodeId);
    if (!node || node.children.length === 0) return;
    useStore.getState().updateNode(nodeId, { collapsed: !node.collapsed });
  },

  collapseAllNodeChildren(nodeId: string) {
    const { nodes, updateNode, getNodeChildren } = useStore.getState();

    const collapseRecursively = (id: string) => {
      const node = nodes.get(id);
      if (!node) return;
      // Collapse this node
      updateNode(id, { collapsed: true });
      // Collapse all children recursively
      const children = getNodeChildren(id);
      children.forEach((child) => {
        collapseRecursively(child.node_id);
      });
    };
    collapseRecursively(nodeId);
  },
};

// function wrapApiMethods<T extends object>(api: T, options?: { skip?: (keyof T)[] }): T {
//   const skip = new Set(options?.skip ?? []);

//   for (const key of Object.keys(api) as (keyof T)[]) {
//     const original = api[key];

//     if (typeof original === "function" && !skip.has(key)) {
//       api[key] = function (this: any, ...args: any[]) {
//         if (!this.dataIsLoaded) {
//           throw new DataNotLoadedError("Data is not loaded");
//         }
//         return original.apply(this, args);
//       } as T[typeof key];
//     }
//   }

//   return api;
// }

// wrapApiMethods(TreeRoAPI, {
//   skip: ["useStore", "dataIsLoaded", "loadInitialData", "throwErrorIfDataNotLoaded", TreeRoAPI.createGroup, TreeRoAPI.createDocument, TreeRoAPI.createNode],
// });

declare global {
  interface Window {
    TreeRoAPI: TreeRoAPIType;
  }
}

window.TreeRoAPI = TreeRoAPI;

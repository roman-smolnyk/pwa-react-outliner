import { IDBApi } from "./db";
import { mockupDocument, mockupGroup, mockupNodes } from "./mockupData";
import { useStore } from "./stateStore";
import type { DocumentDataType, GroupDataType, NodeDataType, TreeRoAPIType } from "./types";

export class DataNotLoadedError extends Error {}

export const TreeRoAPI: TreeRoAPIType = {
  useStore: useStore, // expose to userscript
  IDBApi: IDBApi, // expose to userscript

  dataIsLoaded: false,
  changesQueue: [],

  // Async method to load initial data
  async loadInitialData() {
    // await DB.resetDb();
    let currentDocId = await IDBApi.loadCurrentDocumentId();
    let rootGroupId = await IDBApi.loadRootGroupId();
    const groups = await IDBApi.loadGroups();
    const documents = await IDBApi.loadDocuments();
    const nodes = await IDBApi.loadNodes();

    if (!rootGroupId) {
      currentDocId = mockupDocument.document_id;
      rootGroupId = mockupGroup.group_id;
      nodes.push(...mockupNodes);
      documents.push(mockupDocument);
      groups.push(mockupGroup);

      await IDBApi.saveNodes(mockupNodes);
      await IDBApi.saveDocument(mockupDocument);
      await IDBApi.saveGroup(mockupGroup);
      await IDBApi.saveRootGroupId(rootGroupId);
      await IDBApi.saveCurrentDocumentId(currentDocId);
    }

    // if (!rootGroupId) {
    //   const newRootNode = TreeRoAPI.createNode("Untitled");
    //   const newDocument = TreeRoAPI.createDocument(newRootNode.node_id);
    //   const newRootGroup = TreeRoAPI.createGroup("Root Group");
    //   newRootGroup.children.push(newDocument.document_id);
    //   currentDocId = newDocument.document_id;
    //   rootGroupId = newRootGroup.group_id;

    //   nodes.push(newRootNode);
    //   documents.push(newDocument);
    //   groups.push(newRootGroup);

    //   await DB.saveNode(newRootNode);
    //   await DB.saveDocument(newDocument);
    //   await DB.saveGroup(newRootGroup);
    //   await DB.saveRootGroupId(rootGroupId);
    //   await DB.saveCurrentDocumentId(currentDocId);

    //   // Temp
    //   const newNode = TreeRoAPI.createNode("Sample Text");
    //   newRootNode.children.push(newNode.node_id);
    //   nodes.push(newNode);
    //   await DB.saveNode(newNode);
    // }

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
    return Array.from(useStore.getState().groups.values());
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
    return Array.from(useStore.getState().documents.values());
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
    const updatedNodes = useStore.getState().insertNode(node, parentNodeId, index);
    if (updatedNodes.length === 0) return [];
    IDBApi.saveNodes(updatedNodes);
    return updatedNodes;
  },

  insertNodeRelativeTo(node, relNodeId, offset = 1) {
    const updatedNodes = useStore.getState().insertNodeRelativeTo(node, relNodeId, offset);
    if (updatedNodes.length === 0) return [];
    IDBApi.saveNodes(updatedNodes);
    return updatedNodes;
  },

  updateNode(nodeId, newNodeData) {
    const updatedNode = useStore.getState().updateNode(nodeId, { modified: Date.now(), ...newNodeData });
    if (!updatedNode) return null;
    IDBApi.saveNode(updatedNode);
    return updatedNode;
  },

  getNodeChildren(nodeId) {
    return useStore.getState().getNodeChildren(nodeId);
  },

  getNodeParent(nodeId) {
    return useStore.getState().getNodeParent(nodeId);
  },

  getNodeSibling(nodeId, offset) {
    return useStore.getState().getNodeSibling(nodeId, offset);
  },

  getNodeIndex(nodeId) {
    return useStore.getState().getNodeIndex(nodeId);
  },

  moveNode(nodeId, parentNodeId, index) {
    const updatedNodes = useStore.getState().moveNode(nodeId, parentNodeId, index);
    if (updatedNodes.length === 0) return [];
    IDBApi.saveNodes(updatedNodes);
    return updatedNodes;
  },

  moveNodeRealtiveTo(nodeId, relNodeId, offset) {
    const updatedNodes = useStore.getState().moveNodeRealtiveTo(nodeId, relNodeId, offset);
    if (updatedNodes.length === 0) return [];
    IDBApi.saveNodes(updatedNodes);
    return updatedNodes;
  },

  deleteNode(nodeId) {
    const [updatedParentNode, removedNodeIds] = useStore.getState().deleteNode(nodeId);
    if (!updatedParentNode) return [null, []];
    IDBApi.saveNode(updatedParentNode);
    IDBApi.deleteNodes(removedNodeIds);
    return [updatedParentNode, removedNodeIds];
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

  getCharIndexFromCaret(element) {
    const selection = window.getSelection();
    if (!selection || !selection.anchorNode) return -1;

    let charIndex = 0;
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null);
    while (walker.nextNode()) {
      const node = walker.currentNode as Text;
      if (node === selection.anchorNode) {
        charIndex += selection.anchorOffset;
        break;
      } else {
        charIndex += node.textContent?.length ?? 0;
      }
    }
    return charIndex;
  },

  setCaretAtCharIndex(element, index) {
    const range = document.createRange();
    const selection = window.getSelection();
    if (!selection) return;

    if (index === -1) {
      // Special case: place caret at end
      range.selectNodeContents(element);
      range.collapse(false); // collapse to end
      selection.removeAllRanges();
      selection.addRange(range);
      return;
    }

    let remaining = index;
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null);

    while (walker.nextNode()) {
      const node = walker.currentNode as Text;
      const len = node.textContent?.length ?? 0;

      if (remaining <= len) {
        // Found the node containing our index
        // range.setStart(node, remaining);
        // range.setEnd(node, remaining);
        range.setStart(node, remaining);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
        return;
      } else {
        remaining -= len;
      }
    }

    // If index is beyond text length, place at end
    range.selectNodeContents(element);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
  },

  getCharIndexFromMouse(element, x, y) {
    const pos = document.caretPositionFromPoint(x, y);
    if (!pos) return -1;

    let charIndex = 0;
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (node === pos.offsetNode) {
        charIndex += pos.offset;
        break;
      } else {
        charIndex += node.textContent?.length ?? 0;
      }
    }
    return charIndex;
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

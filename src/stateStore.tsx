import { create } from "zustand";

import type { NodeDataType, zustandUseStoreType, GroupDataType, DocumentDataType } from "./types";

export const useStore = create<zustandUseStoreType>((set, get) => ({
  stateIsInitialized: false,
  currentDocId: "",
  rootGroupId: "",
  groups: new Map(),
  documents: new Map(),
  nodes: new Map(),

  clearStoreState: () => {
    // * Verified
    set({
      stateIsInitialized: false,
      currentDocId: "",
      rootGroupId: "",
      groups: new Map(),
      documents: new Map(),
      nodes: new Map(),
    });
  },

  insertGroup: (group, parentGroupId, index = -1) => {
    set((state) => {
      if (state.groups.has(group.group_id)) return state;
      const parent = state.groups.get(parentGroupId);
      if (!parent) return state;
      if (index === -1 || index >= parent.children.length) {
        parent.children.push(group.group_id);
      } else {
        parent.children.splice(index, 0, group.group_id);
      }
      state.groups.set(group.group_id, group);
      return { groups: new Map(state.groups) };
    });
  },

  updateGroup: (groupId, newGroupData) => {
    set((state) => {
      const group = state.groups.get(groupId);
      if (!group) return state;
      state.groups.set(groupId, { ...group, ...newGroupData });
      return { groups: new Map(state.groups) };
    });
  },

  getGroupChildren: (groupId) => {
    const state = get();
    const group = state.groups.get(groupId);
    if (!group) return [];
    return group.children.map((id) => state.groups.get(id) ?? state.documents.get(id)).filter(Boolean) as (GroupDataType | DocumentDataType)[];
  },

  moveGroup: (groupId, parentGroupId, index = -1) => {
    set((state) => {
      // remove from old parent
      for (const g of state.groups.values()) {
        g.children = g.children.filter((id) => id !== groupId);
      }
      const parent = state.groups.get(parentGroupId);
      if (!parent) return state;
      if (index === -1 || index >= parent.children.length) {
        parent.children.push(groupId);
      } else {
        parent.children.splice(index, 0, groupId);
      }
      return { groups: new Map(state.groups) };
    });
  },

  deleteGroup: (groupId) => {
    set((state) => {
      const group = state.groups.get(groupId);
      if (!group) return state;
      // recursively delete children
      group.children.forEach((id) => {
        if (state.groups.has(id)) {
          get().deleteGroup(id);
        } else if (state.documents.has(id)) {
          get().deleteDocument(id);
        }
      });
      state.groups.delete(groupId);
      // remove from any parent
      for (const g of state.groups.values()) {
        g.children = g.children.filter((id) => id !== groupId);
      }
      return { groups: new Map(state.groups) };
    });
  },

  getDocumentRootNodeId: (docId: string) => {
    const doc = get().documents.get(docId);
    return doc ? doc.root_node_id : null;
  },

  insertDocument: (document, parentGroupId, index = -1) => {
    set((state) => {
      if (state.documents.has(document.document_id)) return state;
      const parent = state.groups.get(parentGroupId);
      if (!parent) return state;
      if (index === -1 || index >= parent.children.length) {
        parent.children.push(document.document_id);
      } else {
        parent.children.splice(index, 0, document.document_id);
      }
      state.documents.set(document.document_id, document);
      return { documents: new Map(state.documents), groups: new Map(state.groups) };
    });
  },

  updateDocument: (docId, newDocData) => {
    set((state) => {
      const doc = state.documents.get(docId);
      if (!doc) return state;
      state.documents.set(docId, { ...doc, ...newDocData });
      return { documents: new Map(state.documents) };
    });
  },

  getDocumentNodes: (docId) => {
    const state = get();
    const doc = state.documents.get(docId);
    if (!doc) return [];
    const root = state.nodes.get(doc.root_node_id);
    if (!root) return [];
    const collect = (node: NodeDataType): NodeDataType[] => {
      return [
        node,
        ...node.children.flatMap((id) => {
          const child = state.nodes.get(id);
          return child ? collect(child) : [];
        }),
      ];
    };
    return collect(root);
  },

  moveDocument: (docId, parentGroupId, index = -1) => {
    set((state) => {
      for (const g of state.groups.values()) {
        g.children = g.children.filter((id) => id !== docId);
      }
      const parent = state.groups.get(parentGroupId);
      if (!parent) return state;
      if (index === -1 || index >= parent.children.length) {
        parent.children.push(docId);
      } else {
        parent.children.splice(index, 0, docId);
      }
      return { groups: new Map(state.groups) };
    });
  },

  deleteDocument: (docId) => {
    set((state) => {
      const doc = state.documents.get(docId);
      if (!doc) return state;
      // recursively delete nodes
      get().deleteNode(doc.root_node_id);
      state.documents.delete(docId);
      for (const g of state.groups.values()) {
        g.children = g.children.filter((id) => id !== docId);
      }
      return { documents: new Map(state.documents), groups: new Map(state.groups) };
    });
  },

  insertNode: (node, parentNodeId, index = -1) => {
    // * Verified
    const updatedNodes: NodeDataType[] = [];
    set((state) => {
      if (state.nodes.has(node.node_id)) return state;
      const parentNode = state.nodes.get(parentNodeId);
      if (!parentNode) return state;

      const newChildren = [...parentNode.children];
      if (index === -1 || index >= parentNode.children.length) {
        newChildren.push(node.node_id);
      } else {
        newChildren.splice(index, 0, node.node_id);
      }

      const newNodes = new Map(state.nodes);
      newNodes.set(node.node_id, node);
      newNodes.set(parentNode.node_id, { ...parentNode, children: newChildren });
      updatedNodes.push(node, parentNode);
      return { nodes: newNodes };
    });
    return updatedNodes;
  },

  insertNodeRelativeTo: (node, relNodeId, offset = 1) => {
    // * Verified
    // TODO: add offset validations
    const updatedNodes: NodeDataType[] = [];
    set((state) => {
      if (state.nodes.has(node.node_id)) return state;
      const parentNode = state.getNodeParent(relNodeId);
      if (!parentNode) return state;
      // Get index of the destination node
      const idx = parentNode.children.indexOf(relNodeId);
      if (idx === -1) return state;
      // Insert node as sibling of destination node
      // newParent.children;
      const newParentChildren = [...parentNode.children];
      newParentChildren.splice(idx + offset, 0, node.node_id);
      // Remove node from old parent
      const newNodes = new Map(state.nodes);
      newNodes.set(node.node_id, node);
      const updatedParentNode = { ...parentNode, children: newParentChildren };
      newNodes.set(updatedParentNode.node_id, updatedParentNode);
      updatedNodes.push(node, updatedParentNode);
      return { nodes: newNodes };
    });
    return updatedNodes;
  },

  updateNode: (nodeId, newNodeData) => {
    // * Verified
    let updatedNode = null;
    set((state) => {
      const node = state.nodes.get(nodeId);
      if (!node) return state;
      updatedNode = { ...node, ...newNodeData };
      state.nodes.set(nodeId, updatedNode);
      return { nodes: new Map(state.nodes) };
    });
    return updatedNode;
  },

  getNodeChildren: (nodeId) => {
    const state = get();
    const node = state.nodes.get(nodeId);
    if (!node) return [];
    return node.children.map((id) => state.nodes.get(id)).filter(Boolean) as NodeDataType[];
  },

  getNodeParent: (nodeId) => {
    // * Verified
    const state = get();
    for (const node of state.nodes.values()) {
      if (node.children.includes(nodeId)) return node;
    }
    return null;
  },

  getNodeSibling: (nodeId, offset) => {
    // * Verified
    if (offset === 0) return null;
    const state = get();
    if (!state.nodes.has(nodeId)) return null;
    const parentNode = state.getNodeParent(nodeId);
    if (!parentNode) return null;
    const idx = parentNode.children.indexOf(nodeId);
    if (idx === -1) return null;
    const siblingNodeId = parentNode.children[idx + offset];
    if (!siblingNodeId) return null;
    return state.nodes.get(siblingNodeId) || null;
  },

  getNodeIndex: (nodeId) => {
    // * Verified
    const state = get();
    const nodeParent = state.getNodeParent(nodeId);
    if (!nodeParent) return null;
    return nodeParent.children.indexOf(nodeId);
  },

  moveNode: (nodeId, parentNodeId, index = -1) => {
    // * Working
    const updatedNodes: NodeDataType[] = [];
    set((state) => {
      if (!state.nodes.get(nodeId)) return state;
      const oldParent = state.getNodeParent(nodeId);
      if (!oldParent) return state;
      const newParent = state.nodes.get(parentNodeId);
      if (!newParent) return state;

      // Remove node from old parent
      const oldParentChildren = oldParent.children.filter((id) => id !== nodeId);
      // Insert node as child of new parent
      const newParentChildren = [...newParent.children];
      if (index === -1 || index >= newParentChildren.length) {
        newParentChildren.push(nodeId);
      } else {
        newParentChildren.splice(index, 0, nodeId);
      }

      const newNodes = new Map(state.nodes);
      const updatedOldParent = { ...oldParent, children: oldParentChildren };
      const updatedNewParent = { ...newParent, children: newParentChildren };
      newNodes.set(oldParent.node_id, updatedOldParent);
      newNodes.set(newParent.node_id, updatedNewParent);
      updatedNodes.push(updatedOldParent, updatedNewParent);
      return { nodes: newNodes };
    });
    return updatedNodes;
  },

  moveNodeRealtiveTo: (nodeId, relNodeId, offset) => {
    // * Verified
    // TODO: Add offset validations
    const updatedNodes: NodeDataType[] = [];
    set((state) => {
      if (offset === 0) return state;
      if (!state.nodes.get(nodeId)) return state;
      const oldParent = state.getNodeParent(nodeId);
      if (!oldParent) return state;
      const newParent = state.getNodeParent(relNodeId);
      if (!newParent) return state;
      // Get index of the relative node
      const idx = newParent.children.indexOf(relNodeId);
      if (idx === -1) return state;

      // Remove node from old parent
      const oldParentChildren = oldParent.children.filter((id) => id !== nodeId);
      // Insert node as sibling of relative node
      const newParentChildren = [...newParent.children];
      newParentChildren.splice(idx + offset, 0, nodeId);

      const newNodes = new Map(state.nodes);
      const updatedOldParent = { ...oldParent, children: oldParentChildren };
      const updatedNewParent = { ...newParent, children: newParentChildren };
      newNodes.set(oldParent.node_id, updatedOldParent);
      newNodes.set(newParent.node_id, updatedNewParent);
      updatedNodes.push(updatedOldParent, updatedNewParent);
      return { nodes: newNodes };
    });

    return updatedNodes;
  },

  deleteNode: (nodeId) => {
    // * Verified
    let updatedParentNode: NodeDataType | null = null;
    const removedNodeIds: string[] = [];
    set((state) => {
      const node = state.nodes.get(nodeId);
      if (!node) return state;
      const parentNode = state.getNodeParent(nodeId);
      if (!parentNode) return state;
      const newParentChildren = parentNode.children.filter((id) => id !== nodeId);
      updatedParentNode = { ...parentNode, children: newParentChildren };
      const newNodes = new Map(state.nodes);

      function deleteRecursive(id: string) {
        const n = state.nodes.get(id);
        if (!n) return;
        for (const childId of n.children) {
          deleteRecursive(childId);
        }
        newNodes.delete(id);
        removedNodeIds.push(id);
      }
      deleteRecursive(nodeId);

      newNodes.set(updatedParentNode.node_id, updatedParentNode);

      return { nodes: newNodes };
    });
    return [updatedParentNode, removedNodeIds];
  },

  queryNodesByText: (text, docId) => {
    const state = get();
    const nodes = docId ? get().getDocumentNodes(docId) : Array.from(state.nodes.values());
    return nodes.filter((n) => n.content.includes(text));
  },
}));

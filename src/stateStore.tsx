import { create } from "zustand";

import { arrayRelativeMove, arrayMove } from "./utilities";
import type { NodeDataType, zustandUseStoreType, GroupDataType, DocumentDataType, DocumentWithNodesDataType, zustandUIStoreType } from "./types";

export const useStore = create<zustandUseStoreType>((set, get) => ({
  stateIsInitialized: false,
  currentDocId: "",
  rootGroupId: "",
  groups: new Map(),
  documents: new Map(),
  nodes: new Map(),
  rerenderNodesToggle: {},

  triggerNodeRender: (nodeId) => {
    // * Verified
    set((state) => {
      return { rerenderNodesToggle: { ...state.rerenderNodesToggle, [nodeId]: !state.rerenderNodesToggle[nodeId] } };
    });
  },

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
    if (!doc) return null;
    const root = state.nodes.get(doc.root_node_id);
    if (!root) return null;
    const collect = (node: NodeDataType): NodeDataType[] => {
      return [
        node,
        ...node.children.flatMap((id) => {
          const child = state.nodes.get(id);
          return child ? collect(child) : [];
        }),
      ];
    };
    const docWithNodes: DocumentWithNodesDataType = { document_id: doc.document_id, root_node_id: doc.root_node_id, nodes: collect(root) };

    return docWithNodes;
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

      const newParentNodeChildren = [...parentNode.children];

      let targetIndex = index < 0 ? newParentNodeChildren.length + index : index;
      targetIndex = Math.max(0, Math.min(targetIndex, newParentNodeChildren.length));
      // Insert node
      newParentNodeChildren.splice(targetIndex, 0, node.node_id);
      const newParentNode = { ...parentNode, children: newParentNodeChildren };

      const newNodes = new Map(state.nodes);
      newNodes.set(node.node_id, node);
      newNodes.set(parentNode.node_id, newParentNode);
      updatedNodes.push(node, newParentNode);
      // console.debug("insertNodeX", { node: node, parentNode: parentNode, targetIndex: targetIndex, newParentNodeChildren: newParentNodeChildren });
      return { nodes: newNodes };
    });
    return updatedNodes;
  },

  insertNodeRelativeTo: (node, relNodeId, offset) => {
    const state = get(); // get current state outside of set
    const parentNode = state.getNodeParent(relNodeId);
    if (!parentNode || state.nodes.has(node.node_id)) return [];

    const relNodeIndex = parentNode.children.indexOf(relNodeId);
    if (relNodeIndex === -1) return [];

    offset = offset < 0 ? offset + 1 : offset;
    const targetIndex = relNodeIndex + offset;

    return state.insertNode(node, parentNode.node_id, targetIndex);
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

  getNodeDescendantsIds: (nodeId) => {
    const descendants: string[] = [];
    const state = get();
    const node = state.nodes.get(nodeId);
    if (!node) return descendants;
    function getDescendants(id: string) {
      const nodeChild = state.nodes.get(id);
      for (const childId of nodeChild?.children || []) {
        descendants.push(childId);
        getDescendants(childId);
      }
    }
    getDescendants(nodeId);

    return descendants;
  },

  moveNode: (nodeId, parentNodeId, index = -1) => {
    // * Verified
    const updatedNodes: NodeDataType[] = [];
    set((state) => {
      if (nodeId === parentNodeId) return state;
      if (!state.nodes.get(nodeId)) return state;
      const nodeParent = state.getNodeParent(nodeId);
      if (!nodeParent) return state;
      const nodeIndex = nodeParent.children.indexOf(nodeId);
      if (nodeIndex === -1) return state;
      const otherNodeParent = state.nodes.get(parentNodeId);
      if (!otherNodeParent) return state;
      const descendants = state.getNodeDescendantsIds(nodeId);
      if (descendants.includes(parentNodeId)) return state;

      const newNodes = new Map(state.nodes);
      if (nodeParent.node_id === otherNodeParent.node_id) {
        // same parent
        const rawTarget = index < 0 ? nodeParent.children.length + index : index;
        const targetIndex = Math.max(0, Math.min(rawTarget, nodeParent.children.length));
        // move
        const newNodeParentChildren = arrayMove(nodeParent.children, nodeIndex, targetIndex);

        // const nodeParentChildren = [...nodeParent.children];
        // let targetIndex = index < 0 ? nodeParentChildren.length + index : index;
        // // remove node
        // nodeParentChildren.splice(nodeIndex, 1);
        // if (nodeIndex < targetIndex) targetIndex -= 1;
        // targetIndex = Math.max(0, Math.min(targetIndex, nodeParentChildren.length));
        // // insert node
        // nodeParentChildren.splice(targetIndex, 0, nodeId);

        const updatedParent = { ...nodeParent, children: newNodeParentChildren };
        newNodes.set(nodeParent.node_id, updatedParent);
        updatedNodes.push(updatedParent);
        return { nodes: newNodes };
      } else {
        // other parent
        const newNodeParentChildren = [...nodeParent.children];
        const newOtherNodeParentChildren = [...otherNodeParent.children];
        // remove node
        newNodeParentChildren.splice(nodeIndex, 1);

        let targetIndex = index < 0 ? newOtherNodeParentChildren.length + index + 1 : index;
        targetIndex = Math.max(0, Math.min(targetIndex, newOtherNodeParentChildren.length));
        // insert node
        newOtherNodeParentChildren.splice(targetIndex, 0, nodeId);

        console.debug({ index: index, targetIndex: targetIndex, otherNodeParentchildren: otherNodeParent.children });

        const updatedOldParent = { ...nodeParent, children: newNodeParentChildren };
        const updatedNewParent = { ...otherNodeParent, children: newOtherNodeParentChildren };
        newNodes.set(nodeParent.node_id, updatedOldParent);
        newNodes.set(otherNodeParent.node_id, updatedNewParent);
        updatedNodes.push(updatedOldParent, updatedNewParent);
        return { nodes: newNodes };
      }
    });
    return updatedNodes;
  },

  moveNodeRelativeTo: (nodeId, relNodeId, offset) => {
    // * Verified
    const updatedNodes: NodeDataType[] = [];
    set((state) => {
      if (offset === 0) return state;
      if (!state.nodes.get(nodeId)) return state;
      const nodeParent = state.getNodeParent(nodeId);
      if (!nodeParent) return state;
      const nodeIndex = nodeParent.children.indexOf(nodeId);
      if (nodeIndex === -1) return state;
      const relNodeParent = state.getNodeParent(relNodeId);
      if (!relNodeParent) return state;
      const relNodeIndex = relNodeParent.children.indexOf(relNodeId);
      if (relNodeIndex === -1) return state;
      const descendants = state.getNodeDescendantsIds(nodeId);
      if (descendants.includes(relNodeParent.node_id)) return state;

      const newNodes = new Map(state.nodes);
      if (nodeParent.node_id === relNodeParent.node_id) {
        // same parent

        const newNodeParentChildren = arrayRelativeMove(nodeParent.children, nodeId, relNodeId, offset);

        const updatedParent = { ...nodeParent, children: newNodeParentChildren };
        newNodes.set(nodeParent.node_id, updatedParent);
        updatedNodes.push(updatedParent);
        return { nodes: newNodes };
      } else {
        // other parent
        const newNodeParentChildren = [...nodeParent.children];
        const newRelNodeParentChildren = [...relNodeParent.children];

        offset = offset < 0 ? offset + 1 : offset;
        let targetIndex = relNodeIndex + offset;
        targetIndex = Math.max(0, Math.min(targetIndex, newRelNodeParentChildren.length));
        // Remove node
        newNodeParentChildren.splice(nodeIndex, 1);
        // Insert node
        newRelNodeParentChildren.splice(targetIndex, 0, nodeId);

        const updatedOldParent = { ...nodeParent, children: newNodeParentChildren };
        const updatedNewParent = { ...relNodeParent, children: newRelNodeParentChildren };
        newNodes.set(nodeParent.node_id, updatedOldParent);
        newNodes.set(relNodeParent.node_id, updatedNewParent);
        updatedNodes.push(updatedOldParent, updatedNewParent);
        return { nodes: newNodes };
      }
    });

    return updatedNodes;
  },

  deleteNode: (nodeId) => {
    // TODO: Test it
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

  // queryNodesByText: (text, docId) => {
  //   const state = get();
  //   const nodes = docId ? get().getDocumentNodes(docId) : Array.from(state.nodes.values());
  //   return nodes.filter((n) => n.content.includes(text));
  // },
}));

export const useUIStore = create<zustandUIStoreType>(() => ({
  dragNDropPlacement: "",
  draggableNodeDescendantsIds: [],
}));

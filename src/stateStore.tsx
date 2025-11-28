import { create } from "zustand";

import type { NodeDataType, zustandUseStoreType, GroupDataType, DocumentDataType, DocumentWithNodesDataType, zustandUIStoreType } from "./types";

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

  insertNode: (node, targetNodeId, index = -1) => {
    // * Verified
    const updatedNodes: NodeDataType[] = [];
    set((state) => {
      if (state.nodes.has(node.node_id)) return state;
      const targetNode = state.nodes.get(targetNodeId);
      if (!targetNode) return state;

      const newTargetNodeChildren = [...targetNode.children];

      let targetIndex = index < 0 ? newTargetNodeChildren.length + index + 1 : index;
      targetIndex = Math.max(0, Math.min(targetIndex, newTargetNodeChildren.length));
      // Insert node
      newTargetNodeChildren.splice(targetIndex, 0, node.node_id);

      node.parent_id = targetNode.node_id;
      const updatedTargetNode = { ...targetNode, children: newTargetNodeChildren };

      const newNodes = new Map(state.nodes);
      newNodes.set(node.node_id, node);
      newNodes.set(targetNode.node_id, updatedTargetNode);
      updatedNodes.push(node, updatedTargetNode);
      return { nodes: newNodes };
    });
    return updatedNodes;
  },

  insertNodeBefore: (node, referenceNodeId) => {
    const state = get();
    const referenceNode = state.nodes.get(referenceNodeId);
    if (!referenceNode) return [];
    const referenceNodeParent = state.getNodeParent(referenceNodeId);
    if (!referenceNodeParent) return [];
    const referenceNodeIndex = referenceNodeParent.children.indexOf(referenceNodeId);

    const targetIndex = referenceNodeIndex;

    return state.insertNode(node, referenceNodeParent.node_id, targetIndex);
  },

  insertNodeAfter: (node, referenceNodeId) => {
    const state = get();
    const referenceNode = state.nodes.get(referenceNodeId);
    if (!referenceNode) return [];
    const referenceNodeParent = state.getNodeParent(referenceNodeId);
    if (!referenceNodeParent) return [];
    const referenceNodeIndex = referenceNodeParent.children.indexOf(referenceNodeId);

    const targetIndex = referenceNodeIndex + 1;

    return state.insertNode(node, referenceNodeParent.node_id, targetIndex);
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
    // * Verified
    const state = get();
    const node = state.nodes.get(nodeId);
    if (!node) return [];
    return node.children.map((id) => state.nodes.get(id)).filter(Boolean) as NodeDataType[];
  },

  getNodeParent: (nodeId) => {
    // * Verified
    const state = get();
    const node = state.nodes.get(nodeId);
    if (!node?.parent_id) return null;
    return state.nodes.get(node.parent_id) || null;

    // for (const node of state.nodes.values()) {
    //   if (node.children.includes(nodeId)) return node;
    // }
    // return null;
  },

  getNodeSibling: (nodeId, offset) => {
    // * Verified
    if (offset === 0) return null;
    const state = get();
    if (!state.nodes.has(nodeId)) return null;
    const nodeParent = state.getNodeParent(nodeId);
    if (!nodeParent) return null;
    const nodeIndex = nodeParent.children.indexOf(nodeId);
    if (nodeIndex === -1) return null;
    const siblingNodeId = nodeParent.children[nodeIndex + offset];
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
    // * Verified
    const state = get();
    const descendants: string[] = [];
    const node = state.nodes.get(nodeId);
    if (!node) return descendants;

    function _getDescendants(id: string) {
      const nodeChild = state.nodes.get(id);
      for (const childId of nodeChild?.children || []) {
        descendants.push(childId);
        _getDescendants(childId);
      }
    }

    _getDescendants(nodeId);
    return descendants;
  },

  moveNode: (movedNodeId, targetNodeId, index = -1) => {
    // * Verified
    const updatedNodes: NodeDataType[] = [];
    set((state) => {
      // Can't move self into self
      if (movedNodeId === targetNodeId) return state;
      // Is it exist?
      const movedNode = state.nodes.get(movedNodeId);
      if (!movedNode) return state;
      // Parent exists?
      const movedNodeParent = state.getNodeParent(movedNodeId);
      if (!movedNodeParent) return state;
      const movedNodeIndex = movedNodeParent.children.indexOf(movedNodeId);
      if (movedNodeIndex === -1) return state;
      const targetNode = state.nodes.get(targetNodeId);
      if (!targetNode) return state;
      // Can't move it in the own children
      const descendants = state.getNodeDescendantsIds(movedNodeId);
      if (descendants.includes(targetNodeId)) return state;

      const newNodes = new Map(state.nodes);
      if (movedNodeParent.node_id === targetNode.node_id) {
        // same parent
        let targetIndex = index < 0 ? movedNodeParent.children.length + index : index;
        targetIndex = Math.max(0, Math.min(targetIndex, movedNodeParent.children.length));
        // No sense
        if (movedNodeIndex === targetIndex) return state;
        // [A, B, C, D, E] (A, E, 4): [B, C, D, E] > [B, C, D, E, A]
        // [A, B, C, D, E] (E, A, 0): [A, B, C, D] > [E, A, B, C, D]
        // [A, B, C, D, E] (B, D, 3): [A, C, D, E] > [A, C, D, B, E]
        // [A, B, C, D, E] (D, B, 1): [A, B, C, E] > [A, D, B, C, E]
        // [A, B, C, D, E] (B, B, 0): [A, C, D, E] > [B, A, C, D, E]
        // [A, B, C, D, E] (B, B, 2): [A, C, D, E] > [B, A, C, D, E]

        const newMovedNodeParentChildren = [...movedNodeParent.children];
        newMovedNodeParentChildren.splice(
          targetIndex,
          0,
          // remove item and reinsert it
          newMovedNodeParentChildren.splice(movedNodeIndex, 1)[0],
        );
        // Parent unchanged
        const updatedMovedNode = { ...movedNode, modified: Date.now() };
        const updatedMovedNodeParent = { ...movedNodeParent, children: newMovedNodeParentChildren };
        newNodes.set(updatedMovedNode.node_id, updatedMovedNode);
        newNodes.set(movedNodeParent.node_id, updatedMovedNodeParent);
        updatedNodes.push(updatedMovedNode, updatedMovedNodeParent);
        return { nodes: newNodes };
      } else {
        // other parent
        const newMovedNodeParentChildren = [...movedNodeParent.children];
        const newTargetNodeChildren = [...targetNode.children];
        // remove node
        newMovedNodeParentChildren.splice(movedNodeIndex, 1);
        // +1 as now array will be larger
        let targetIndex = index < 0 ? newTargetNodeChildren.length + index + 1 : index;
        targetIndex = Math.max(0, Math.min(targetIndex, newTargetNodeChildren.length));
        // [A, B, C, D, E] 5 - 1
        // insert node
        newTargetNodeChildren.splice(targetIndex, 0, movedNodeId);

        console.debug({ index: index, targetIndex: targetIndex, otherNodeParentchildren: targetNode.children });

        const updatedMovedNode = { ...movedNode, parent_id: targetNode.node_id, modified: Date.now() };
        const updatedNodeParent = { ...movedNodeParent, children: newMovedNodeParentChildren };
        const updatedTargetNode = { ...targetNode, children: newTargetNodeChildren };
        newNodes.set(updatedMovedNode.node_id, updatedMovedNode);
        newNodes.set(movedNodeParent.node_id, updatedNodeParent);
        newNodes.set(targetNode.node_id, updatedTargetNode);
        updatedNodes.push(updatedMovedNode, updatedNodeParent, updatedTargetNode);
        return { nodes: newNodes };
      }
    });
    return updatedNodes;
  },

  moveNodeBefore: (movedNodeId, referenceNodeId) => {
    // * Verified
    const state = get();
    if (movedNodeId === referenceNodeId) return [];
    const movedNode = state.nodes.get(movedNodeId);
    if (!movedNode) return [];
    const movedNodeParent = state.getNodeParent(movedNodeId);
    if (!movedNodeParent) return [];
    const movedNodeIndex = movedNodeParent.children.indexOf(movedNodeId);
    if (movedNodeIndex === -1) return [];
    const referenceNode = state.nodes.get(referenceNodeId);
    if (!referenceNode) return [];
    const referenceNodeParent = state.getNodeParent(referenceNodeId);
    if (!referenceNodeParent) return [];
    const referenceNodeIndex = referenceNodeParent.children.indexOf(referenceNodeId);
    if (referenceNodeIndex === -1) return [];

    let targetIndex = movedNodeIndex < referenceNodeIndex ? referenceNodeIndex - 1 : referenceNodeIndex;
    targetIndex = Math.max(0, targetIndex);

    return state.moveNode(movedNodeId, referenceNodeParent.node_id, targetIndex);
  },

  moveNodeAfter: (movedNodeId, referenceNodeId) => {
    // * Verified
    const state = get();
    if (movedNodeId === referenceNodeId) return [];
    const movedNode = state.nodes.get(movedNodeId);
    if (!movedNode) return [];
    const movedNodeParent = state.getNodeParent(movedNodeId);
    if (!movedNodeParent) return [];
    const movedNodeIndex = movedNodeParent.children.indexOf(movedNodeId);
    if (movedNodeIndex === -1) return [];
    const referenceNode = state.nodes.get(referenceNodeId);
    if (!referenceNode) return [];
    const referenceNodeParent = state.getNodeParent(referenceNodeId);
    if (!referenceNodeParent) return [];
    const referenceNodeIndex = referenceNodeParent.children.indexOf(referenceNodeId);
    if (referenceNodeIndex === -1) return [];

    let targetIndex = 0;
    if (movedNodeParent.node_id === referenceNodeParent.node_id) {
      targetIndex = movedNodeIndex > referenceNodeIndex ? referenceNodeIndex + 1 : referenceNodeIndex;
    } else {
      targetIndex = referenceNodeIndex + 1;
    }

    targetIndex = Math.min(targetIndex, referenceNodeParent.children.length);

    return state.moveNode(movedNodeId, referenceNodeParent.node_id, targetIndex);
  },

  deleteNode: (nodeId) => {
    // TODO: Test it
    let updatedNodeParent: NodeDataType | null = null;
    const removedNodeIds: string[] = [];
    set((state) => {
      const node = state.nodes.get(nodeId);
      if (!node) return state;
      const nodeParent = state.getNodeParent(nodeId);
      if (!nodeParent) return state;
      const newParentChildren = nodeParent.children.filter((id) => id !== nodeId);
      updatedNodeParent = { ...nodeParent, children: newParentChildren };
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

      newNodes.set(updatedNodeParent.node_id, updatedNodeParent);

      return { nodes: newNodes };
    });
    return [updatedNodeParent, removedNodeIds];
  },

  // queryNodesByText: (text, docId) => {
  //   const state = get();
  //   const nodes = docId ? get().getDocumentNodes(docId) : Array.from(state.nodes.values());
  //   return nodes.filter((n) => n.content.includes(text));
  // },
}));

export const useUIStore = create<zustandUIStoreType>((set, get) => ({
  nodesToRender: {},
  nodesContentToRender: {},
  dragNDropPlacement: "",
  draggableNodeDescendantsIds: [],
  activeEditNodeId: "",
  activeEditCaretPosition: 0,

  triggerNodeRender: (nodeId) => {
    // * Verified
    set((state) => {
      return { nodesToRender: { ...state.nodesToRender, [nodeId]: !state.nodesToRender[nodeId] } };
    });
  },
  triggerNodeContentRender: (nodeId) => {
    // * Verified
    set((state) => {
      return { nodesContentToRender: { ...state.nodesContentToRender, [nodeId]: !state.nodesContentToRender[nodeId] } };
    });
  },
}));

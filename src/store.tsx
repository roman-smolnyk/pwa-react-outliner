import { create } from "zustand";

import type { NodeDataType, zustandUseStoreType, GroupDataType, DocumentDataType } from "./types";

export const useStore = create<zustandUseStoreType>((set, get) => ({
  currentDocId: "",
  rootGroupId: "",
  groups: new Map(),
  documents: new Map(),
  nodes: new Map(),

  addGroup: (parentGroupId, group) => {
    set((state) => {
      if (state.groups.has(group.group_id)) return state;
      const parent = state.groups.get(parentGroupId);
      if (!parent) return state;
      parent.children.push(group.group_id);
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

  addDocument: (parentGroupId, document, index) => {
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

  addNode: (parentNodeId, node, index = -1) => {
    set((state) => {
      if (state.nodes.has(node.node_id)) return state;
      const parent = state.nodes.get(parentNodeId);
      if (!parent) return state;
      if (index === -1 || index >= parent.children.length) {
        parent.children.push(node.node_id);
      } else {
        parent.children.splice(index, 0, node.node_id);
      }
      state.nodes.set(node.node_id, node);
      return { nodes: new Map(state.nodes) };
    });
  },

  updateNode: (nodeId, newNodeData) => {
    set((state) => {
      const node = state.nodes.get(nodeId);
      if (!node) return state;
      state.nodes.set(nodeId, { ...node, ...newNodeData });
      return { nodes: new Map(state.nodes) };
    });
  },

  getNodeChildren: (nodeId) => {
    const state = get();
    const node = state.nodes.get(nodeId);
    if (!node) return [];
    return node.children.map((id) => state.nodes.get(id)).filter(Boolean) as NodeDataType[];
  },

  getNodeParent: (nodeId) => {
    const state = get();
    for (const node of state.nodes.values()) {
      if (node.children.includes(nodeId)) return node;
    }
    return null;
  },

  moveNode: (nodeId, parentNodeId, index = -1) => {
    set((state) => {
      for (const n of state.nodes.values()) {
        n.children = n.children.filter((id) => id !== nodeId);
      }
      const parent = state.nodes.get(parentNodeId);
      if (!parent) return state;
      if (index === -1 || index >= parent.children.length) {
        parent.children.push(nodeId);
      } else {
        parent.children.splice(index, 0, nodeId);
      }
      return { nodes: new Map(state.nodes) };
    });
  },

  deleteNode: (nodeId) => {
    set((state) => {
      const node = state.nodes.get(nodeId);
      if (!node) return state;
      node.children.forEach((id) => {
        get().deleteNode(id);
      });
      state.nodes.delete(nodeId);
      for (const n of state.nodes.values()) {
        n.children = n.children.filter((id) => id !== nodeId);
      }
      return { nodes: new Map(state.nodes) };
    });
  },

  queryNodesByText: (text, docId) => {
    const state = get();
    const nodes = docId ? get().getDocumentNodes(docId) : Array.from(state.nodes.values());
    return nodes.filter((n) => n.content.includes(text));
  },

  clearStore: () => {
    set({
      currentDocId: "",
      rootGroupId: "",
      groups: new Map(),
      documents: new Map(),
      nodes: new Map(),
    });
  },
}));

// getDocumentZ: (docId) => {
//     const doc = get().documents.find((d) => d.document_id === docId);
//     return doc || null;
//   },
//   getNodeZ: (docId: string, nodeId: string) => {
//     const doc = get().getDocumentZ(docId);
//     if (!doc) return null;
//     return doc.nodes.find((n) => n.id === nodeId) || null;
//   },
//   getNodeChildrenZ: (docId: string, nodeId: string) => {
//     const node = get().getNodeZ(docId, nodeId);
//     if (!node) return [];
//     const childNodes: NodeDataType[] = [];
//     for (const childId of node.children) {
//       const childNode = get().getNodeZ(docId, childId);
//       if (childNode) childNodes.push(childNode);
//     }
//     return childNodes;
//   },
//   updateNodeZ: (docId, nodeId, newNodeData) => {
//     set((state) => ({
//       documents: state.documents.map((doc) =>
//         doc.document_id === docId
//           ? {
//               ...doc,
//               nodes: doc.nodes.map((node) => (node.id === nodeId ? { ...node, ...newNodeData } : node)),
//             }
//           : doc,
//       ),
//     }));
//   },

//   addNodeZ: (docId, parentNodeId, nodeData, index = -1) => {
//     set((state) => {
//       const doc = state.documents.find((d) => d.document_id === docId);
//       if (!doc) return state;

//       // Find parent node to determine correct index
//       const parentNode = doc.nodes.find((n) => n.id === parentNodeId);
//       const insertIndex = index === -1 && parentNode ? parentNode.children.length : index;

//       // Insert new node's id into parent's children at index
//       const newNodes = doc.nodes.map((node) =>
//         node.id === parentNodeId
//           ? {
//               ...node,
//               children: [...node.children.slice(0, insertIndex), nodeData.id, ...node.children.slice(insertIndex)],
//             }
//           : node,
//       );

//       newNodes.push(nodeData);

//       return {
//         documents: state.documents.map((d) => (d.document_id === docId ? { ...d, nodes: newNodes } : d)),
//       };
//     });
//   },

//   moveNodeZ: (srcDocId, srcNodeId, destDocId, destNodeId, index) => {
//     set((state) => {
//       let srcDoc = state.documents.find((d) => d.document_id === srcDocId);
//       let destDoc = state.documents.find((d) => d.document_id === destDocId);
//       if (!srcDoc || !destDoc) return state;

//       // Find parent of srcNodeId
//       let parentNodeId: string | null = null;
//       for (const node of srcDoc.nodes) {
//         if (node.children.includes(srcNodeId)) {
//           parentNodeId = node.id;
//           break;
//         }
//       }

//       let newSrcNodes = srcDoc.nodes;
//       if (parentNodeId) {
//         newSrcNodes = newSrcNodes.map((node) => (node.id === parentNodeId ? { ...node, children: node.children.filter((id) => id !== srcNodeId) } : node));
//       }

//       // Find destination node to determine correct index
//       const destNode = destDoc.nodes.find((n) => n.id === destNodeId);
//       const insertIndex = index === -1 && destNode ? destNode.children.length : index;

//       // Move node to destDoc/destNodeId at index
//       let newDestNodes = destDoc.nodes.map((node) =>
//         node.id === destNodeId
//           ? {
//               ...node,
//               children: [...node.children.slice(0, insertIndex), srcNodeId, ...node.children.slice(insertIndex)],
//             }
//           : node,
//       );

//       // If moving across docs, move the node data as well
//       if (srcDocId !== destDocId) {
//         const movingNode = srcDoc.nodes.find((n) => n.id === srcNodeId);
//         if (movingNode) {
//           newDestNodes = [...newDestNodes, movingNode];
//           newSrcNodes = newSrcNodes.filter((n) => n.id !== srcNodeId);
//         }
//       }

//       return {
//         documents: state.documents.map((d) => {
//           if (d.document_id === srcDocId) return { ...d, nodes: newSrcNodes };
//           if (d.document_id === destDocId) return { ...d, nodes: newDestNodes };
//           return d;
//         }),
//       };
//     });
//   },
//   // ! Recursive
//   deleteNodeZ: (docId, nodeId) => {
//     set((state) => {
//       const doc = state.documents.find((d) => d.document_id === docId);
//       if (!doc) return state;
//       // Build a fast lookup map for all nodes
//       const map = new Map(doc.nodes.map((n) => [n.id, n]));

//       function collectDescendants(map: Map<string, NodeDataType>, nodeId: string): string[] {
//         const node = map.get(nodeId);
//         if (!node) return [];
//         return node.children.flatMap((childId) => [childId, ...collectDescendants(map, childId)]);
//       }

//       // Collect all descendant IDs (recursive)
//       const idsToDelete = [nodeId, ...collectDescendants(map, nodeId)];
//       // Remove nodes that are in idsToDelete
//       let newNodes = doc.nodes.filter((n) => !idsToDelete.includes(n.id));
//       // Clean up children arrays in remaining nodes
//       newNodes = newNodes.map((n) => ({
//         ...n,
//         children: n.children.filter((id) => !idsToDelete.includes(id)),
//       }));

//       return {
//         documents: state.documents.map((d) => (d.document_id === docId ? { ...d, nodes: newNodes } : d)),
//       };
//     });
//   },

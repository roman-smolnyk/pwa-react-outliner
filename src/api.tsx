import { useStore } from "./store";
import type { DocumentDataType, GroupDataType, NodeDataType, TreeRoAPIType, DocumentWithNodesDataType } from "./types";

export const TreeRoAPI: TreeRoAPIType = {
  useStore: useStore, // For external userscripts
  changesQueue: [],

  getCurrentDocId: () => {
    return useStore.getState().currentDocId;
  },
  getRootGroupId: () => {
    return useStore.getState().rootGroupId;
  },

  updateStateFromStructure: (structure) => {
    const groups = useStore.getState().groups;
    const documents = useStore.getState().documents;
    structure.groups.forEach((group) => {
      groups.set(group.group_id, group);
      group.children.forEach((id) => {
        const g = structure.groups.find((a) => a.group_id === id);
        if (g) {
          groups.set(id, g);
        } else {
          const d = structure.documents.find((a) => a.document_id === id);
          if (d) documents.set(id, d);
        }
      });
    });
    useStore.setState({
      currentDocId: structure.current_document_id,
      rootGroupId: structure.root_group_id,
      groups: new Map(groups),
      documents: new Map(documents),
    });
  },

  updateStateFromDoc: (doc) => {
    const nodes = useStore.getState().nodes;
    doc.nodes.forEach((n) => {
      nodes.set(n.node_id, n);
    });
    useStore.setState({ nodes: new Map(nodes) });
  },

  listGroups: () => {
    return () => Array.from(useStore.getState().groups.values());
  },

  createGroup: () => {
    const newGroup: GroupDataType = {
      group_id: crypto.randomUUID(),
      name: "New Group",
      collapsed: false,
      children: [],
    };
    return newGroup;
  },

  addGroup: (parentGroupId, group) => {
    useStore.getState().addGroup(parentGroupId, group);
  },

  updateGroup: (groupId, newGroupData) => {
    useStore.getState().updateGroup(groupId, newGroupData);
  },

  getGroupChildren: (groupId) => {
    return useStore.getState().getGroupChildren(groupId);
  },

  moveGroup: (groupId, parentGroupId, index) => {
    useStore.getState().moveGroup(groupId, parentGroupId, index);
  },

  deleteGroup: (groupId) => {
    useStore.getState().deleteGroup(groupId);
  },

  listDocuments: () => {
    return () => Array.from(useStore.getState().documents.values());
  },

  getDocumentRootNodeId: (docId) => {
    return useStore.getState().getDocumentRootNodeId(docId);
  },

  createDocument: () => {
    const newDoc: DocumentDataType = {
      document_id: crypto.randomUUID(),
      root_node_id: crypto.randomUUID(),
      // nodes: [],
    };
    return newDoc;
  },

  addDocument: (parentGroupId, document, index) => {
    useStore.getState().addDocument(parentGroupId, document, index);
  },

  updateDocument: (docId, newDocData) => {
    useStore.getState().updateDocument(docId, newDocData);
  },

  getDocumentNodes: (docId) => {
    return useStore.getState().getDocumentNodes(docId);
  },

  moveDocument: (docId, parentGroupId, index) => {
    useStore.getState().moveDocument(docId, parentGroupId, index);
  },

  deleteDocument: (docId) => {
    useStore.getState().deleteDocument(docId);
  },

  openDocument: (docId) => {
    useStore.setState({ currentDocId: docId });
  },

  listNodes: (docId) => {
    if (docId) {
      return useStore.getState().getDocumentNodes(docId);
    }
    return Array.from(useStore.getState().nodes.values());
  },

  createNode: (content = "", collapsed = false, args = {}) => {
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

  addNode: (parentNodeId, node, index) => {
    useStore.getState().addNode(parentNodeId, node, index);
  },

  updateNode: (nodeId, newNodeData) => {
    useStore.getState().updateNode(nodeId, newNodeData);
  },

  getNodeChildren: (nodeId) => {
    return useStore.getState().getNodeChildren(nodeId);
  },

  getNodeParent: (nodeId) => {
    return useStore.getState().getNodeParent(nodeId);
  },

  moveNode: (nodeId, parentNodeId, index) => {
    useStore.getState().moveNode(nodeId, parentNodeId, index);
  },

  deleteNode: (nodeId) => {
    useStore.getState().deleteNode(nodeId);
  },

  queryNodesByText: (text, docId) => {
    return useStore.getState().queryNodesByText(text, docId);
  },

  toggleNodeCollapse: (nodeId) => {
    const node = useStore.getState().nodes.get(nodeId);
    if (!node) return;
    if (node.children.length === 0) return; // nothing to (un)collapse
    useStore.getState().updateNode(nodeId, { collapsed: !node.collapsed });
  },

  collapseAllNodeChildren: (nodeId: string) => {
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

declare global {
  interface Window {
    TreeRoAPI: TreeRoAPIType;
  }
}

window.TreeRoAPI = TreeRoAPI;

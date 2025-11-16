import type { StoreApi, UseBoundStore } from "zustand";

export interface NodeDataType {
  node_id: string;
  content: string;
  collapsed: boolean;
  created: number;
  modified: number;
  children: string[];
}

export interface DocumentDataType {
  document_id: string;
  root_node_id: string;
  // nodes: NodeDataType[];
  // As title used root node content
}

export interface DocumentWithNodesDataType {
  document_id: string;
  root_node_id: string;
  nodes: NodeDataType[];
  // As title used root node content
}

export interface GroupDataType {
  group_id: string;
  name: string;
  collapsed: boolean;
  children: (string | string)[]; // can be document_id or group_id
}

export interface OutlinerStructureDataType {
  current_document_id: string;
  root_group_id: string;
  groups: GroupDataType[];
  documents: DocumentDataType[];
}

// -----------------------
// Zustand store
// -----------------------
export interface zustandUseStoreType {
  // useStore.setState({ currentDocId: "" });
  // const node = useStore.getState().nodes.get(nodeId)
  currentDocId: string;
  rootGroupId: string;
  groups: Map<string, GroupDataType>;
  documents: Map<string, DocumentDataType>;
  nodes: Map<string, NodeDataType>;
  // Group methods
  addGroup: (parentGroupId: string, group: GroupDataType) => void;
  updateGroup: (groupId: string, newGroupData: Partial<GroupDataType>) => void;
  getGroupChildren: (groupId: string) => (GroupDataType | DocumentDataType)[];
  moveGroup: (groupId: string, parentGroupId: string, index?: number) => void;
  deleteGroup: (groupId: string) => void;
  // ...
  // Document methods
  getDocumentRootNodeId: (docId: string) => string | null;
  addDocument: (parentGroupId: string, document: DocumentDataType, index: number) => void;
  updateDocument: (docId: string, newDocData: Partial<DocumentDataType>) => void;
  getDocumentNodes: (docId: string) => NodeDataType[];
  moveDocument: (docId: string, parentGroupId: string, index?: number) => void;
  deleteDocument: (docId: string) => void;
  // Node methods
  insertNode: (node: NodeDataType, parentNodeId: string, index?: number) => void;
  insertNodeAfter: (node: NodeDataType, nodeId: string) => void;
  insertNodeBefore: (node: NodeDataType, nodeId: string) => void;
  updateNode: (nodeId: string, newNodeData: Partial<NodeDataType>) => void;
  getNodeChildren: (nodeId: string) => NodeDataType[];
  getNodeParent: (nodeId: string) => NodeDataType | null;
  moveNode: (nodeId: string, parentNodeId: string, index?: number) => void;
  moveNodeAfter: (nodeId: string, targetNodeId: string) => void;
  moveNodeBefore: (nodeId: string, targetNodeId: string) => void;
  deleteNode: (nodeId: string) => void;
  queryNodesByText: (text: string, docId?: string) => NodeDataType[];
  // on logout clear store
  clearStore: () => void;
}

export interface TreeRoAPIType {
  useStore: UseBoundStore<StoreApi<zustandUseStoreType>>; // or your specific store type
  changesQueue: [];
  // State methods
  getCurrentDocId: () => string;
  getRootGroupId: () => string;
  updateStateFromStructure: (structure: OutlinerStructureDataType) => void;
  updateStateFromDoc: (doc: DocumentWithNodesDataType) => void;
  // Group methods
  listGroups(): () => GroupDataType[];
  createGroup: () => GroupDataType;
  addGroup: (parentGroupId: string, group: GroupDataType) => void;
  updateGroup: (groupId: string, newGroupData: Partial<GroupDataType>) => void;
  getGroupChildren: (groupId: string) => (GroupDataType | DocumentDataType)[];
  moveGroup: (groupId: string, parentGroupId: string, index?: number) => void;
  deleteGroup: (groupId: string) => void;
  // Document methods
  listDocuments(): () => DocumentDataType[];
  getDocumentRootNodeId: (docId: string) => string | null;
  createDocument: () => DocumentDataType;
  addDocument: (parentGroupId: string, document: DocumentDataType, index: number) => void;
  updateDocument: (docId: string, newDocData: Partial<DocumentDataType>) => void;
  getDocumentNodes: (docId: string) => NodeDataType[];
  moveDocument: (docId: string, parentGroupId: string, index?: number) => void;
  deleteDocument: (docId: string) => void;
  openDocument: (docId: string) => void; // currentDocId
  // Node methods
  listNodes: (docId?: string) => NodeDataType[];
  createNode: (content?: string, collapsed?: boolean, args?: Partial<NodeDataType>) => NodeDataType;
  addNode: (parentNodeId: string, node: NodeDataType, index?: number) => void;
  updateNode: (nodeId: string, newNodeData: Partial<NodeDataType>) => void;
  getNodeChildren: (nodeId: string) => NodeDataType[];
  getNodeParent: (nodeId: string) => NodeDataType | null;
  moveNode: (nodeId: string, parentNodeId: string, index?: number) => void;
  deleteNode: (nodeId: string) => void;
  queryNodesByText: (text: string, docId?: string) => NodeDataType[];
  toggleNodeCollapse: (nodeId: string) => void;
  collapseAllNodeChildren: (nodeId: string) => void;
}

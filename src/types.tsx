import type { StoreApi, UseBoundStore } from "zustand";
// import type { IDBPDatabase } from "idb";

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
  // As title used root node content
}

// This one is for atomic updates, atom = document
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
  // groups: GroupDataType[];
  // documents: DocumentDataType[];
}

export interface FlattenedNodeType {
  node_id: string;
  parent_id: string | null;
  depth: number;
  index: number;
  collapsed: boolean;
  children: string[];
}

// -----------------------
// IndexedDB Database
// -----------------------
export interface TreeRoIndexedDbType {
  groups: GroupDataType;
  documents: DocumentDataType;
  nodes: NodeDataType;
  // meta
}

export interface IDBApiType {
  logPrefix: string;
  // Meta
  resetDb(): Promise<void>;
  saveCurrentDocumentId(docId: string): Promise<void>;
  loadCurrentDocumentId(): Promise<string | null>;
  saveRootGroupId(groupId: string): Promise<void>;
  loadRootGroupId(): Promise<string | null>;

  // Groups
  saveGroup(group: GroupDataType): Promise<void>;
  loadGroups(): Promise<GroupDataType[]>;
  deleteGroup(groupId: string): Promise<void>;

  // Documents
  saveDocument(doc: DocumentDataType): Promise<void>;
  loadDocuments(): Promise<DocumentDataType[]>;
  deleteDocument(docId: string): Promise<void>;

  // Nodes
  saveNode(node: NodeDataType): Promise<void>;
  saveNodes(nodes: NodeDataType | NodeDataType[]): Promise<void>;
  loadNodes(): Promise<NodeDataType[]>;
  deleteNode(nodeId: string): Promise<void>;
  deleteNodes(nodeIds: string | string[]): Promise<void>;
  queryNodesByPredicate(predicate: (node: NodeDataType) => boolean): Promise<NodeDataType[]>;
}

// -----------------------
// Zustand store
// -----------------------
export interface zustandUseStoreType {
  // useStore.setState({ currentDocId: "" });
  // const node = useStore.getState().nodes.get(nodeId)

  // ---------------- State ----------------
  stateIsInitialized: boolean;
  currentDocId: string;
  rootGroupId: string;
  groups: Map<string, GroupDataType>;
  documents: Map<string, DocumentDataType>;
  nodes: Map<string, NodeDataType>;
  rerenderNodesToggle: Record<string, boolean>;

  // ---------------- State Storage methods ----------------
  triggerNodeRender: (nodeId: string) => void;
  clearStoreState: () => void;

  // ---------------- Group Methods ----------------
  insertGroup: (group: GroupDataType, parentGroupId: string, index?: number) => void;
  updateGroup: (groupId: string, newGroupData: Partial<GroupDataType>) => void;
  getGroupChildren: (groupId: string) => (GroupDataType | DocumentDataType)[];
  moveGroup: (groupId: string, parentGroupId: string, index?: number) => void;
  deleteGroup: (groupId: string) => void;

  // ---------------- Document Methods ----------------
  getDocumentRootNodeId: (docId: string) => string | null;
  insertDocument: (document: DocumentDataType, parentGroupId: string, index?: number) => void;
  // insertDocumentAfter: (document: DocumentDataType, siblingId: string) => void;
  // insertDocumentBefore: (document: DocumentDataType, siblingId: string) => void;
  updateDocument: (docId: string, newDocData: Partial<DocumentDataType>) => void;
  getDocumentNodes: (docId: string) => DocumentWithNodesDataType | null;
  moveDocument: (docId: string, parentGroupId: string, index?: number) => void;
  // moveDocumentAfter: (docId: string, siblingId: string) => void;
  // moveDocumentBefore: (docId: string, siblingId: string) => void;
  deleteDocument: (docId: string) => void;
  // buildTree: (docId: string) => void;

  // ---------------- Node Methods ----------------
  insertNode: (node: NodeDataType, parentNodeId: string, index?: number) => NodeDataType[];
  insertNodeRelativeTo: (node: NodeDataType, relNodeId: string, offset: number) => NodeDataType[];
  updateNode: (nodeId: string, newNodeData: Partial<NodeDataType>) => NodeDataType | null;
  getNodeChildren: (nodeId: string) => NodeDataType[];
  getNodeParent: (nodeId: string) => NodeDataType | null;
  getNodeSibling: (nodeId: string, offset: number) => NodeDataType | null;
  getNodeIndex: (nodeId: string) => number | null;
  getNodeDescendantsIds: (nodeId: string) => string[];
  moveNode: (nodeId: string, parentNodeId: string, index?: number) => NodeDataType[];
  moveNodeRelativeTo: (nodeId: string, relNodeId: string, offset: number) => NodeDataType[];
  deleteNode: (nodeId: string) => [NodeDataType | null, string[]];
  // queryNodesByText: (text: string, docId?: string) => NodeDataType[];
}

// -----------------------
// TreeRo API
// -----------------------

export interface ChangeEventType {
  type: "insert" | "update" | "delete" | "move";
  target: "group" | "document" | "node";
  payload: GroupDataType | DocumentDataType | NodeDataType;
}

export interface TreeRoAPIType {
  // Zustand store
  useStore: UseBoundStore<StoreApi<zustandUseStoreType>>;
  // Database API
  IDBApi: IDBApiType;
  // Api version
  version: string;

  // State
  dataIsLoaded: boolean;
  changesQueue: ChangeEventType[] | []; // refine with a ChangeEvent type later

  // ---------------- DB Methods ----------------
  loadInitialData(): Promise<void>;
  // updateStateFromStructure(structure: OutlinerStructureDataType): void;
  // updateStateFromDoc(doc: DocumentWithNodesDataType): void;

  // ---------------- Meta Methods ----------------
  getCurrentDocId(): string;
  setCurrentDocId(docId: string): void;
  getRootGroupId(): string;
  setRootGroupId(groupId: string): void;

  // ---------------- Group Methods ----------------
  listGroups(): GroupDataType[];
  createGroup(name?: string, collapsed?: boolean): GroupDataType;
  insertGroup(group: GroupDataType, parentGroupId: string, index?: number): void;
  updateGroup(groupId: string, newGroupData: Partial<GroupDataType>): void;
  getGroupChildren(groupId: string): (GroupDataType | DocumentDataType)[];
  moveGroup(groupId: string, parentGroupId: string, index?: number): void;
  deleteGroup(groupId: string): void;

  // ---------------- Document Methods ----------------
  listDocuments(): DocumentDataType[];
  getDocumentRootNodeId(docId: string): string | null;
  createDocument(rootNodeId: string): DocumentDataType;
  insertDocument(document: DocumentDataType, parentGroupId: string, index?: number): void;
  updateDocument(docId: string, newDocData: Partial<DocumentDataType>): void;
  getDocumentNodes(docId: string): DocumentWithNodesDataType | null;
  moveDocument(docId: string, parentGroupId: string, index?: number): void;
  deleteDocument(docId: string): void;
  openDocument(docId: string): void; // sets currentDocId

  // ---------------- Node Methods ----------------
  createNode(content?: string, collapsed?: boolean, args?: Partial<NodeDataType>): NodeDataType;
  insertNode(node: NodeDataType, parentNodeId: string, index?: number): NodeDataType[];
  insertNodeRelativeTo(node: NodeDataType, relNodeId: string, offset: number): NodeDataType[];
  updateNode(nodeId: string, newNodeData: Partial<NodeDataType>): NodeDataType | null;
  getAllNodes(docId?: string): NodeDataType[];
  getNode: (nodeId: string) => NodeDataType | null;
  getNodeChildren(nodeId: string): NodeDataType[];
  getNodeParent(nodeId: string): NodeDataType | null;
  getNodeSibling: (nodeId: string, offset: number) => NodeDataType | null;
  getNodeIndex: (nodeId: string) => number | null;
  getNodeDescendantsIds: (nodeId: string) => string[];
  moveNode: (nodeId: string, parentNodeId: string, index?: number) => NodeDataType[];
  moveNodeRelativeTo: (nodeId: string, relNodeId: string, offset: number) => NodeDataType[];
  deleteNode(nodeId: string): [NodeDataType | null, string[]];
  // queryNodesByText(text: string, docId?: string): NodeDataType[];
  toggleNodeCollapse(nodeId: string): void;
  collapseAllNodeChildren(nodeId: string): void;
  // ---------------- Caret Methods  ----------------
  getCharIndexFromCaret(element: HTMLElement): number;
  setCaretAtCharIndex(element: HTMLElement, index: number): void;
  getCharIndexFromMouse(element: HTMLElement, x: number, y: number): number;
}

// -----------------------
// Zustand dragNDrop store
// -----------------------
export interface DragNDropStoreType {
  placement: string;
  descendantsIds: string[];
}

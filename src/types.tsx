import type { IDBPDatabase } from "idb";
import type * as Y from "yjs";
import type { StoreApi, UseBoundStore } from "zustand";
import type { Yjs } from "./yjsEnv";

export interface NodeDataType {
  node_id: string;
  // only root node and new node have parent_id === null;
  parent_id: string | null;
  content: string;
  collapsed: boolean;
  created: number;
  modified: number;
  children: string[];
}
export interface YNodeDataType extends Y.Map<string | null | boolean | number | Y.Array<string> | Y.Text> {
  get(key: "node_id"): string;
  get(key: "parent_id"): string | null;
  get(key: "content"): Y.Text;
  get(key: "collapsed"): boolean;
  get(key: "created"): number;
  get(key: "modified"): number;
  get(key: "children"): Y.Array<string>;
}

export interface DocumentDataType {
  document_id: string;
  parent_id: string;
  root_node_id: string;
  // As title used root node content
}
export interface YDocumentDataType extends Y.Map<string> {
  get(key: "document_id"): string;
  get(key: "parent_id"): string;
  get(key: "root_node_id"): string;
}

// This one is for atomic updates, atom = document
export interface DocumentWithNodesDataType {
  document_id: string;
  parent_id: string;
  root_node_id: string;
  nodes: NodeDataType[];
  // As title used root node content
}

export interface GroupDataType {
  group_id: string;
  parent_id: string | null;
  name: string;
  collapsed: boolean;
  children: string[]; // can be document_id or group_id
}
export interface YGroupDataType extends Y.Map<string | boolean | Y.Array<string>> {
  get(key: "group_id"): string;
  get(key: "parent_id"): string | null;
  get(key: "name"): string;
  get(key: "collapsed"): boolean;
  get(key: "children"): Y.Array<string>;
}

export interface MetaDataType {
  root_group_id: string;
}
export interface YMetaDataType extends Y.Map<string> {
  get(key: "root_group_id"): string;
}

// export interface SettingsDataType {
//   count: string;
// }

export interface FlattenedNodeType {
  node_id: string;
  parent_id: string | null;
  depth: number;
  index: number;
  collapsed: boolean;
  children: string[];
}

export interface LocalConfigType {
  currentDocumentId: string;
  roomToken: string;
  isAuthorized: boolean;
}

export interface LocalIndexedDbDataType {
  localConfig: LocalConfigType;
}

export interface IDBLocalType {
  db: IDBPDatabase<LocalIndexedDbDataType> | null;
  clearData(): Promise<void>;
  getLocalConfig(): Promise<LocalConfigType | undefined>;
  setLocalConfig(localConfig: LocalConfigType): Promise<void>;
}

// -----------------------
// Zustand store
// -----------------------
export interface zustandUseStoreType {
  // ---------------- Data State ----------------
  stateIsInitialized: boolean;
  localConfig: LocalConfigType;
  meta: MetaDataType;
  groups: Map<string, GroupDataType>;
  documents: Map<string, DocumentDataType>;
  nodes: Map<string, NodeDataType>;
  // ---------------- UI State ----------------
  nodesToRender: Record<string, boolean>;
  nodesContentToRender: Record<string, boolean>;

  dndRectEl: HTMLDivElement | null;
  dndPlacement: string;
  dndDescendantsIds: string[];
  dndToRerender: Record<string, boolean>;

  activeNodeId: string;
  currentCaretPosition: number;

  explorerIsOpened: boolean;
  globalSearchIsOpened: boolean;

  wsStatus: "connecting" | "connected" | "disconnected";

  clearData: () => void;

  triggerNodeRender: (nodeId: string) => void;
  triggerNodeContentRender: (nodeId: string) => void;
  triggerDnDRender: (id: string) => void;

  getCharIndexFromCaret: (element: HTMLElement) => number;
  setCaretAtCharIndex: (element: HTMLElement, index: number) => void;
  getCharIndexFromMouse: (element: HTMLElement, x: number, y: number) => number;

  activateNode: (nodeId: string, caretPosition?: number) => void;
}

// -----------------------
// TreeRo API
// -----------------------
// TODO: Check order!!!
export interface TreeRoAPIType {
  // Api version
  version: string;
  // Yjs
  Yjs: typeof Yjs;
  // idb local
  IDBLocal: IDBLocalType;
  // Zustand store
  useStore: UseBoundStore<StoreApi<zustandUseStoreType>>;

  initialize(callback?: () => void): Promise<void>;
  isIntialized(): boolean;
  _addUpdateStateObserver(): void;
  initRootData(): void;
  clearData(reload?: boolean): void;

  // ---------------- Meta Methods ----------------
  isAuthorized(): boolean;
  setIsAuthorized(isAuthorized: boolean): void;
  generateRoomToken(): string;
  getRoomToken(): string | null;
  setRoomToken(roomToken: string): void;
  getCurrentDocumentId(): string | null;
  setCurrentDocumentId(documentId: string): void;
  getRootGroupId(): string;

  // ---------------- Group Methods ----------------
  insertNewGroup(targetGroupId: string, name?: string, index?: number): string | null;
  insertNewGroupBefore(referenceGroupId: string, name?: string): string | null;
  insertNewGroupAfter(referenceGroupId: string, name?: string): string | null;
  getGroups(groupId?: string): InstanceType<typeof Yjs.YGroupWrap>[];
  getGroup(groupId: string): InstanceType<typeof Yjs.YGroupWrap> | null;
  getGroupChildren(groupId: string): (InstanceType<typeof Yjs.YGroupWrap> | InstanceType<typeof Yjs.YDocumentWrap>)[];
  getParentGroup(childId: string): InstanceType<typeof Yjs.YGroupWrap> | null;
  getGroupDescendantsIds(groupId: string): string[];
  updateGroup(groupId: string, { name, collapsed }: { name?: string | undefined; collapsed?: boolean | undefined }): void;
  moveGroup(movedGroupId: string, targetGroupId: string, index: number): void;
  moveGroupBefore(movedGroupId: string, referenceId: string): void;
  moveGroupAfter(movedGroupId: string, referenceId: string): void;
  deleteGroup(groupId: string): void;
  uiToggleGroupCollapse(groupId: string): void;

  // ---------------- Document Methods ----------------
  insertNewDocument(targetGroupId: string, rootNodeContent?: string, index?: number): string | null;
  insertNewDocumentBefore(referenceId: string, rootNodeContent?: string): void;
  insertNewDocumentAfter(referenceId: string, rootNodeContent?: string): void;
  getDocuments(groupId?: string): InstanceType<typeof Yjs.YDocumentWrap>[];
  getDocument(documentId: string): InstanceType<typeof Yjs.YDocumentWrap> | null;
  getDocumentRootNodeId(documentId: string): string | null;
  traverseDocumentPath(documentId: string): string[];
  updateDocument(documentId: string, rootNodeContent: string): void;
  moveDocument(movedDocumentId: string, targetGroupId: string, index: number): void;
  moveDocumentBefore(movedDocumentId: string, referenceId: string): void;
  moveDocumentAfter(movedDocumentId: string, referenceId: string): void;
  deleteDocument(documentId: string): void; // TODO

  // ---------------- Node Methods ----------------
  insertNewNode(targetNodeId: string, content?: string, index?: number, args?: Partial<NodeDataType>): string | null;
  insertNewNodeBefore(referenceNodeId: string, content?: string, args?: Partial<NodeDataType>): string | null;
  insertNewNodeAfter(referenceNodeId: string, content?: string, args?: Partial<NodeDataType>): string | null;
  getNodes(documentId?: string): InstanceType<typeof Yjs.YNodeWrap>[];
  getNode(nodeId: string): InstanceType<typeof Yjs.YNodeWrap> | null;
  getNodeChildren(nodeId: string): InstanceType<typeof Yjs.YNodeWrap>[];
  getNodeParent(nodeId: string): InstanceType<typeof Yjs.YNodeWrap> | null;
  getNodeSibling(nodeId: string, offset: number): InstanceType<typeof Yjs.YNodeWrap> | null;
  getNodeIndex(nodeId: string): number | null;
  getNodeDocumentId(nodeId: string): string | null;
  getNodeDescendantsIds(nodeId: string): string[];
  traverseNodePath(nodeId: string): string[];
  updateNode(nodeId: string, { content, collapsed }: { content?: string | undefined; collapsed?: boolean | undefined }): void;
  moveNode(movedNodeId: string, targetNodeId: string, index: number): void;
  moveNodeBefore(movedNodeId: string, referenceNodeId: string): void;
  moveNodeAfter(movedNodeId: string, referenceNodeId: string): void;
  deleteNode(nodeId: string): void;

  uiIndentNode(nodeId: string): void;
  uiUnindentNode(nodeId: string): void;
  uiMoveNodeUp(nodeId: string): void;
  uiMoveNodeDown(nodeId: string): void;
  uiToggleNodeCollapse(nodeId: string): void;
  uiToggleNodeDescendantsCollapse(nodeId: string): void;
}

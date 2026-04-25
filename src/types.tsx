
// src/types.ts
export interface BlockState {
  block_id: string;
  parent_id: string | null;
  content: string;
  collapsed: boolean;
  children: string[];
}

export interface PageState {
  page_id: string;
  parent_id: string;
  root_block_id: string;
}

export interface CollectionState {
  collection_id: string;
  parent_id: string | null;
  name: string;
  collapsed: boolean;
  children: string[];
}

export interface WorkspaceState {
  workspace_id: string;
  root_collection_id: string;
  inbox_block_id: string;
  version: number;
}

export interface LocalConfigState {
  roomToken: string;
  authorized: boolean;
  workspaceId: string;
  currentPageId: string;
  currentBlockId: string;
}

export interface LocalConfigType {
  get: () => LocalConfigState;
  set: (localConfig: Partial<LocalConfigState>) => void;
  clearData: () => void;
}

// -----------------------
// Zustand store
// -----------------------
export interface zustandUseStoreType {
  // ---------------- Data State ----------------
  stateIsInitialized: boolean;
  localConfig: LocalConfigState;
  blocks: Map<string, BlockState>;
  pages: Map<string, PageState>;
  collections: Map<string, CollectionState>;
  workspace: WorkspaceState;

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
  checkboxSelectionIsActive: boolean;

  documentSearchIsOpened: boolean;

  wsStatus: "connecting" | "connected" | "disconnected" | "turned off";

  clearData: () => void;

  triggerNodeRender: (nodeId: string) => void;
  triggerNodeContentRender: (nodeId: string) => void;
  triggerDnDRender: (id: string) => void;

  getCharIndexFromCaret: (element: HTMLElement) => number;
  setCaretAtCharIndex: (element: HTMLElement, index: number) => void;
  getCharIndexFromMouse: (element: HTMLElement, x: number, y: number) => number;

  activateNode: (nodeId: string, caretPosition?: number) => void;
}

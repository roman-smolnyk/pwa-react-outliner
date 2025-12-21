import { create } from "zustand";
import type { zustandUseStoreType } from "./types";

export const useStore = create<zustandUseStoreType>((set, get) => ({
  stateIsInitialized: false,
  localConfig: { currentDocumentId: "", roomToken: "", isAuthorized: false },
  meta: { root_group_id: "" },
  groups: new Map(),
  documents: new Map(),
  nodes: new Map(),

  nodesToRender: {},
  nodesContentToRender: {},

  dndRectEl: null,
  dndPlacement: "",
  dndDescendantsIds: [],
  dndToRerender: {},

  activeNodeId: "",
  currentCaretPosition: 0,

  explorerIsOpened: true,

  wsStatus: "disconnected",

  triggerNodeRender: (nodeId) => {
    set((state) => {
      return { nodesToRender: { ...state.nodesToRender, [nodeId]: !state.nodesToRender[nodeId] } };
    });
  },
  triggerNodeContentRender: (nodeId) => {
    set((state) => {
      return { nodesContentToRender: { ...state.nodesContentToRender, [nodeId]: !state.nodesContentToRender[nodeId] } };
    });
  },
  triggerDnDRender: (id) => {
    set((state) => {
      return { dndToRerender: { ...state.dndToRerender, [id]: !state.dndToRerender[id] } };
    });
  },

  getCharIndexFromCaret: (element) => {
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

  setCaretAtCharIndex: (element, index) => {
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

  getCharIndexFromMouse: (element, x, y) => {
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

  activateNode: (nodeId, caretPosition = 0) => {
    set({ activeNodeId: nodeId });
    set({ currentCaretPosition: caretPosition });
    get().triggerNodeContentRender(nodeId);
  },
}));

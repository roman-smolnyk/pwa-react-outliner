import { Clipboard } from "@capacitor/clipboard";
import {
  createInsertBlock,
  createInsertBlockAfter,
  createInsertCollection,
  createInsertPage,
  deleteBlock,
  deleteCollection,
  deletePage,
  getItem,
  getItemParent,
  getItemSibling,
  isRootItem,
  moveItem,
  moveItemAfter,
  moveItemBefore,
  type YBlockMap,
} from "esm-treero-api";
import { nanoid } from "nanoid";
import localPreferencesManager from "../store/preferences";
import useZustandStore from "../store/useZustandStore";
import yjs from "../store/yjsManager";
import { isMobile } from "../utils/utilities";

export function generateRoomToken(): string {
  return nanoid(64);
}

export async function login(webSocketServerUrl: string, roomToken: string) {
  console.debug(`login`, webSocketServerUrl, roomToken);
  await localPreferencesManager.setBatch({ isAuthorized: true, roomToken: roomToken, webSocketServerUrl: webSocketServerUrl });
  useZustandStore.setState({ isAuthorized: true, roomToken: roomToken, isNewAccount: false });
}

export async function register(webSocketServerUrl: string) {
  console.debug(`register`, webSocketServerUrl);
  const newRoomToken = generateRoomToken();
  await localPreferencesManager.setBatch({ isAuthorized: true, roomToken: newRoomToken, webSocketServerUrl: webSocketServerUrl });
  useZustandStore.setState({ isAuthorized: true, roomToken: newRoomToken, isNewAccount: true });
}

export async function logout() {
  await clearAllData();
  window.location.replace(window.location.href);
}

export async function clearAllData() {
  // await localPreferencesManager.clearNamespace();
  await localPreferencesManager.clear();
  await yjs.idbPersistence?.clearData();
}

export function selectBlock(id: string, caretCharIndex: number) {
  useZustandStore.setState({ focusBlockId: id, caretCharIndex: caretCharIndex });
}

export async function handleBlockOpen(id: string) {
  console.debug(`openBlock`, id);
  useZustandStore.setState({ rootBlockId: id });
  if (isMobile()) {
    useZustandStore.getState().collapseExplorer();
  }
  await localPreferencesManager.set("rootBlockId", id);
}

export function handleBlockCollapseToggle(id: string) {
  const yblock = getItem(yjs.yblocks, id);
  yblock.set("collapsed", !yblock.get("collapsed"));
}

export function handleBlockAdd(id: string) {
  let newYblock: YBlockMap;
  if (isRootItem(yjs.yblocks, id)) {
    newYblock = createInsertBlock(yjs.ydoc, "", id, 0);
  } else {
    newYblock = createInsertBlockAfter(yjs.ydoc, "", id);
  }
  selectBlock(newYblock.get("id"), 0);
}

export function handleBlockDelete(id: string) {
  if (isRootItem(yjs.yblocks, id)) {
    return;
  }
  const ysibling = getItemSibling(yjs.yblocks, id, -1);
  const yparent = getItemParent(yjs.yblocks, id);
  selectBlock(ysibling ? ysibling.get("id") : yparent.get("id"), -1);
  deleteBlock(yjs.ydoc, id);
}

export function handleBlockIndent(id: string) {
  if (isRootItem(yjs.yblocks, id)) {
    return;
  }
  const ysibling = getItemSibling(yjs.yblocks, id, -1);
  if (ysibling) {
    yjs.ydoc.transact(() => {
      ysibling.set("collapsed", false);
      moveItem(yjs.ydoc, yjs.yblocks, id, ysibling.get("id"), -1);
    });
  }
}

export function handleBlockOutdent(id: string) {
  if (isRootItem(yjs.yblocks, id)) {
    return;
  }
  const yparent = getItemParent(yjs.yblocks, id)!;
  if (yparent && !isRootItem(yjs.yblocks, yparent.get("id"))) {
    moveItemAfter(yjs.ydoc, yjs.yblocks, id, yparent.get("id"));
  }
}

export function handleBlockMoveUp(id: string) {
  if (isRootItem(yjs.yblocks, id)) {
    return;
  }
  const ysibling = getItemSibling(yjs.yblocks, id, -1);
  if (ysibling) {
    moveItemBefore(yjs.ydoc, yjs.yblocks, id, ysibling.get("id"));
  }
}

export function handleBlockMoveDown(id: string) {
  if (isRootItem(yjs.yblocks, id)) {
    return;
  }
  const ysibling = getItemSibling(yjs.yblocks, id, 1);
  if (ysibling) {
    moveItemAfter(yjs.ydoc, yjs.yblocks, id, ysibling.get("id"));
  }
}

export function handleBlockSelectUp(id: string) {
  if (isRootItem(yjs.yblocks, id)) {
    return;
  }
  const ysibling = getItemSibling(yjs.yblocks, id, -1);
  const yparent = getItemParent(yjs.yblocks, id)!;
  if (ysibling) {
    selectBlock(ysibling.get("id"), -1);
  } else if (yparent) {
    selectBlock(yparent.get("id"), -1);
  }
}

export function handleBlockSelectDown(id: string) {
  const yitem = getItem(yjs.yblocks, id);
  const ysibling = getItemSibling(yjs.yblocks, id, 1);
  if (ysibling) {
    selectBlock(ysibling.get("id"), 0);
  } else if (yitem.get("collapsed") === false && yitem.get("children").length > 0) {
    selectBlock(yitem.get("children").get(0), 0);
  }
}

export function handlePageAdd(id: string) {
  yjs.ydoc.transact(() => {
    createInsertPage(yjs.ydoc, "Untitled", id, 0);
    getItem(yjs.yexplorer, id).set("collapsed", false);
  });
}

export function handleCollectionAdd(id: string) {
  yjs.ydoc.transact(() => {
    const ycollection = createInsertCollection(yjs.ydoc, "Untitled", id, 0);
    ycollection.set("collapsed", true);
    getItem(yjs.yexplorer, id).set("collapsed", false);
  });
}

export function handlePageDelete(id: string) {
  deletePage(yjs.ydoc, id);
}

export function handleCollectionDelete(id: string) {
  deleteCollection(yjs.ydoc, id);
}

export function handleUndo() {
  yjs.undoManager?.undo();
}

export function handleRedo() {
  yjs.undoManager?.redo();
}

export async function copyToClipboard(text: string) {
  try {
    await Clipboard.write({ string: text });
  } catch (_error) {
    // console.error(error);
    copyFallback(text);
  }
}

function copyFallback(text: string) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand?.("copy");
  document.body.removeChild(textarea);
}

export async function hardPWAReload() {
  if (!navigator.onLine) return;

  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(registrations.map((reg) => reg.unregister()));

  const cacheKeys = await caches.keys();
  await Promise.all(cacheKeys.map((key) => caches.delete(key)));

  const url = new URL(window.location.href);
  url.searchParams.set("v", String(Date.now()));
  setTimeout(() => {
    window.location.replace(url);
  }, 0);
  // window.location.href = url.toString();
}

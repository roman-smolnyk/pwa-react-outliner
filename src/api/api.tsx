import { Clipboard } from "@capacitor/clipboard";
import {
  createInsertBlock,
  createInsertBlockAfter,
  createInsertCollection,
  createInsertPage,
  deleteBlock,
  deleteCollection,
  deletePage,
  getBlock,
  getBookmarks,
  getCollection,
  getItem,
  getItemDescendantIds,
  getItemParent,
  getItemSibling,
  getPage,
  isRootItem,
  moveItem,
  moveItemAfter,
  moveItemBefore,
  type YBlockMap,
} from "esm-treero-api";
import debounce from "lodash/debounce";
import log from "loglevel";
import { nanoid } from "nanoid";
import { toast } from "sonner";
import localPreferencesManager from "../store/preferences";
import useStore from "../store/useStore";
import yjs from "../store/yjsManager";
import { flattenAndFilterYTree, isMobile } from "../utils/utilities";

export function generateRoomToken(): string {
  return nanoid(64);
}

export async function login(webSocketServerUrl: string, roomToken: string) {
  log.debug(`login`, webSocketServerUrl, roomToken);
  await localPreferencesManager.setBatch({ isAuthorized: true, roomToken: roomToken, webSocketServerUrl: webSocketServerUrl });
  useStore.setState({ isAuthorized: true, roomToken: roomToken, webSocketServerUrl: webSocketServerUrl, isNewAccount: false });
}

export async function signup(webSocketServerUrl: string, username: string) {
  log.debug(`signup`, webSocketServerUrl, username);
  const newRoomToken = generateRoomToken();
  await localPreferencesManager.setBatch({ isAuthorized: true, roomToken: newRoomToken, webSocketServerUrl: webSocketServerUrl });
  useStore.setState({
    isAuthorized: true,
    roomToken: newRoomToken,
    webSocketServerUrl: webSocketServerUrl,
    isNewAccount: true,
    username: username ?? "Username",
  });
}

export async function refreshToken() {
  log.debug(`refreshToken`);
  const newRoomToken = generateRoomToken();
  await localPreferencesManager.set("roomToken", newRoomToken);
  useStore.setState({ roomToken: newRoomToken });
  reload();
}

export async function reload() {
  window.location.replace(window.location.href);
}

export async function logout() {
  await clearAllData();
  reload();
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

export async function clearAllData() {
  // await localPreferencesManager.clearNamespace();
  await localPreferencesManager.clear();
  await yjs.idbPersistence?.clearData();
}

export async function setWebSocketServer({
  isWebSocketServerOn,
  webSocketServerUrl,
}: {
  isWebSocketServerOn?: boolean;
  webSocketServerUrl?: string;
}) {
  log.debug(`setWebSocket`, isWebSocketServerOn, webSocketServerUrl);
  if (webSocketServerUrl !== undefined) {
    await localPreferencesManager.set("webSocketServerUrl", webSocketServerUrl);
    useStore.setState({ webSocketServerUrl: webSocketServerUrl });
    yjs.addWebsocketProvider(webSocketServerUrl, useStore.getState().roomToken, { connect: useStore.getState().isWebSocketServerOn });
    listenWebSocketStatus();
  }
  if (isWebSocketServerOn !== undefined) {
    await localPreferencesManager.set("isWebSocketServerOn", isWebSocketServerOn);
    useStore.setState({ isWebSocketServerOn: isWebSocketServerOn });
    if (isWebSocketServerOn) {
      yjs.wsProvider?.connect();
    } else {
      yjs.wsProvider?.disconnect();
    }
  }
}
export const debouncedSetWebSocketServer = debounce(setWebSocketServer, 500);

export async function listenWebSocketStatus() {
  yjs.wsProvider?.on("status", (e) => {
    log.debug("WebsocketProvider status", e.status);
    if (e.status === "connecting") {
      useStore.setState({ webSocketConnectionStatus: "connecting" });
    } else if (e.status === "connected") {
      useStore.setState({ webSocketConnectionStatus: "connected" });
    } else if (e.status === "disconnected") {
      useStore.setState({ webSocketConnectionStatus: "disconnected" });
    }
  });
}

export function handleUndo() {
  yjs.undoManager?.undo();
  useStore.getState().renderPage();
}

export function handleRedo() {
  yjs.undoManager?.redo();
  useStore.getState().renderPage();
}

export function selectBlock(id: string, caretCharIndex: number) {
  useStore.setState({ activeBlockId: id, caretCharIndex: caretCharIndex });
}

export async function handleBlockOpen(id: string) {
  log.debug(`openBlock`, id);
  useStore.setState({ rootBlockId: id });
  if (isMobile()) {
    handleExplorerClose();
  }
  await localPreferencesManager.set("rootBlockId", id);
}

export function handleBlockCollapseToggle(id: string) {
  const yblock = getItem(yjs.yblocks, id);
  yblock.set("collapsed", !yblock.get("collapsed"));
}

export function handleBlockAdd(id: string) {
  if (useStore.getState().isCheckboxSelectionActive) return;
  let newYblock: YBlockMap;
  if (isRootItem(yjs.yblocks, id)) {
    newYblock = createInsertBlock(yjs.ydoc, "", id, 0);
  } else {
    newYblock = createInsertBlockAfter(yjs.ydoc, "", id);
  }
  selectBlock(newYblock.get("id"), 0);
}

export function handleBlockDelete(id: string) {
  if (useStore.getState().isCheckboxSelectionActive) return;
  if (isRootItem(yjs.yblocks, id)) {
    return;
  }
  if (useStore.getState().activeBlockId) {
    const ysibling = getItemSibling(yjs.yblocks, id, -1);
    const yparent = getItemParent(yjs.yblocks, id);
    selectBlock(ysibling ? ysibling.get("id") : yparent.get("id"), -1);
  }
  deleteBlock(yjs.ydoc, id);
}

export function handleBlockDeleteBatch() {
  const checkedParentBlockIds = getCheckedParentBlockIds();

  // const ids = new Set([id, ...checkedParentBlockIds]);

  yjs.ydoc.transact(() => {
    for (const id of checkedParentBlockIds) {
      deleteBlock(yjs.ydoc, id);
    }
  });
  useStore.setState({ checkedBlockIds: new Set() });
}

export function handleBlockIndent(id: string) {
  if (useStore.getState().isCheckboxSelectionActive) return;
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
  if (useStore.getState().isCheckboxSelectionActive) return;
  if (isRootItem(yjs.yblocks, id)) {
    return;
  }
  const yparent = getItemParent(yjs.yblocks, id)!;
  if (yparent && !isRootItem(yjs.yblocks, yparent.get("id"))) {
    moveItemAfter(yjs.ydoc, yjs.yblocks, id, yparent.get("id"));
  }
}

export function handleBlockMoveUp(id: string) {
  if (useStore.getState().isCheckboxSelectionActive) return;
  if (isRootItem(yjs.yblocks, id)) {
    return;
  }
  const ysibling = getItemSibling(yjs.yblocks, id, -1);
  if (ysibling) {
    moveItemBefore(yjs.ydoc, yjs.yblocks, id, ysibling.get("id"));
  }
}

export function handleBlockMoveDown(id: string) {
  log.debug("handleBlockMoveDown");
  if (useStore.getState().isCheckboxSelectionActive) return;
  if (isRootItem(yjs.yblocks, id)) {
    return;
  }
  const ysibling = getItemSibling(yjs.yblocks, id, 1);
  if (ysibling) {
    yjs.ydoc.transact(() => {
      moveItemAfter(yjs.ydoc, yjs.yblocks, id, ysibling.get("id"));
    });
  }
}

export function handleBlockSelectUp(id: string, rootBlockId: string) {
  const flattenedItems = flattenAndFilterYTree(yjs.yblocks, rootBlockId, true);
  const index = flattenedItems.findIndex((a) => a.id === id);
  const item = flattenedItems[index - 1];
  if (item) {
    selectBlock(item.id, -1);
  }
}

export function handleBlockSelectDown(id: string, rootBlockId: string) {
  const flattenedItems = flattenAndFilterYTree(yjs.yblocks, rootBlockId, true);
  const index = flattenedItems.findIndex((a) => a.id === id);
  const item = flattenedItems[index + 1];
  if (item) {
    selectBlock(item.id, 0);
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

export async function copyToClipboard(text: string) {
  try {
    await Clipboard.write({ string: text });
  } catch (_error) {
    // log.error(error);
    copyFallback(text);
  }
  toast("Copied");
}

function copyFallback(text: string) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand?.("copy");
  document.body.removeChild(textarea);
}

export function handleBlockCheckbox(id: string, checked: boolean) {
  const { checkedBlockIds } = useStore.getState();
  const yblock = getItem(yjs.yblocks, id);
  if (checkedBlockIds.has(yblock.get("parent_id") as string)) {
    return;
  }
  const descendantIds = getItemDescendantIds(yjs.yblocks, id);
  if (checked && !checkedBlockIds.has(id)) {
    useStore.setState({ checkedBlockIds: new Set([...checkedBlockIds, id, ...descendantIds]) });
  } else {
    [id, ...descendantIds].forEach((a) => checkedBlockIds.delete(a));
    useStore.setState({ checkedBlockIds: new Set([...checkedBlockIds]) });
  }
}

export function handleBlockMove(id: string, parentId: string, indexInParent: number) {
  if (useStore.getState().isCheckboxSelectionActive) {
    handleBlockMoveBatch(parentId, indexInParent);
  } else {
    yjs.ydoc.transact(() => {
      moveItem(yjs.ydoc, yjs.yblocks, id, parentId, indexInParent);
      getItem(yjs.yblocks, parentId).set("collapsed", false);
    });
  }
}

export function handleBlockMoveBatch(parentId: string, indexInParent: number) {
  const checkedParentBlockIds = getCheckedParentBlockIds();
  const flattenedItems = flattenAndFilterYTree(yjs.yblocks, useStore.getState().rootBlockId, true);

  // const ids = new Set([id, ...checkedParentBlockIds]);
  const sortedIds = flattenedItems.map((item) => item.id).filter((itemId) => checkedParentBlockIds.has(itemId));

  yjs.ydoc.transact(() => {
    let prevId = sortedIds[0];
    if (prevId) {
      moveItem(yjs.ydoc, yjs.yblocks, prevId, parentId, indexInParent);
      for (const id of sortedIds.slice(1)) {
        moveItemAfter(yjs.ydoc, yjs.yblocks, id, prevId);
        prevId = id;
      }
      getItem(yjs.yblocks, parentId).set("collapsed", false);
    }
  });
}

function getCheckedParentBlockIds(): Set<string> {
  const { checkedBlockIds } = useStore.getState();

  const itemsToRemove = new Set<string>();
  for (const itemId of checkedBlockIds) {
    // Optimization: If this item is already marked for removal by a previous
    // parent's scan, do NOT fetch its descendants again.
    if (itemsToRemove.has(itemId)) continue;

    const descendants = getItemDescendantIds(yjs.yblocks, itemId);

    for (const descId of descendants) {
      itemsToRemove.add(descId);
    }
  }

  return new Set([...checkedBlockIds].filter((id) => !itemsToRemove.has(id)));
}

export async function lockScreen() {
  const lockScreenPin = await localPreferencesManager.get("lockScreenPin");
  if (!lockScreenPin) return;
  useStore.setState({ isLockScreenOpen: true });
}

export async function togglePageSearch() {
  useStore.setState((s) => ({ isPageSearchActive: !s.isPageSearchActive, isCheckboxSelectionActive: false }));
}

export async function toggleGlobalSearch() {
  useStore.setState((s) => ({ isGlobalSearchOpen: !s.isGlobalSearchOpen }));
}

export async function toggleCheckboxSelection() {
  useStore.setState((s) => {
    return { isCheckboxSelectionActive: !s.isCheckboxSelectionActive, checkedBlockIds: new Set(), isPageSearchActive: false };
  });
}

export async function toggleSettings() {
  useStore.setState((s) => ({ isSettingsOpen: !s.isSettingsOpen }));
}

export async function toggleCommandPalette() {
  useStore.setState((s) => ({ isCommandPaletteOpen: !s.isCommandPaletteOpen }));
}

export function handleExplorerOpen() {
  useStore.getState().sidebarPanel?.expand();
  useStore.setState({ isExplorerOpen: true });
  if (isMobile()) {
    useStore.setState({ isPageSearchActive: false });
  }
}

export function handleExplorerClose() {
  useStore.getState().sidebarPanel?.collapse();
  useStore.setState({ isExplorerOpen: false });
}

export async function handleExplorerToggle() {
  const { isExplorerOpen } = useStore.getState();
  if (isExplorerOpen) {
    handleExplorerClose();
  } else {
    handleExplorerOpen();
  }
}

export function handleUsernameUpdate(username: string) {
  yjs.yaccount.set("username", username);
  useStore.setState({ username: username ?? "Username" });
}

export function handleSetAsInbox(id: string) {
  const yblock = getBlock(yjs.ydoc, id);
  yjs.yaccount.set("inbox_id", yblock.get("id"));
}

export function handleSortBlockChildren(id: string, options: { descending?: boolean; caseSensitive?: boolean } = {}): void {
  const yblock = getBlock(yjs.ydoc, id);
  const ychildren = yblock.get("children");

  if (!ychildren || ychildren.length <= 1) return;

  const childItems = ychildren.toArray().map((childId: string) => {
    const childBlock = getBlock(yjs.ydoc, childId);
    const content = childBlock.get("content").toString();
    return { id: childId, content };
  });

  childItems.sort((a, b) => {
    let strA = a.content;
    let strB = b.content;

    if (options.caseSensitive === false) {
      strA = strA.toLowerCase();
      strB = strB.toLowerCase();
    }

    const comparison = strA.localeCompare(strB, undefined, { numeric: true, sensitivity: "base" });
    return options.descending ? -comparison : comparison;
  });

  yjs.ydoc.transact(() => {
    // Clear out the current array order
    ychildren.delete(0, ychildren.length);
    // Re-insert the items in their newly sorted order
    const sortedIds = childItems.map((item) => item.id);
    ychildren.insert(0, sortedIds);
  });
}

export function handleSortCollectionChildren(id: string, options: { descending?: boolean; caseSensitive?: boolean } = {}): void {
  const ycollection = getCollection(yjs.ydoc, id);
  const ychildren = ycollection.get("children");

  if (!ychildren || ychildren.length <= 1) return;

  const childItems = ychildren.toArray().map((childId: string) => {
    const childEntry = getItem(yjs.yexplorer, childId);
    const title = childEntry.get("title");
    return { id: childId, title };
  });

  childItems.sort((a, b) => {
    let titleA = a.title;
    let titleB = b.title;

    if (options.caseSensitive === false) {
      titleA = titleA.toLowerCase();
      titleB = titleB.toLowerCase();
    }

    const comparison = titleA.localeCompare(titleB, undefined, { numeric: true, sensitivity: "base" });
    return options.descending ? -comparison : comparison;
  });

  yjs.ydoc.transact(() => {
    // Clear the current children list
    ychildren.delete(0, ychildren.length);
    // Insert them back in alphabetical/natural order
    const sortedIds = childItems.map((item) => item.id);
    ychildren.insert(0, sortedIds);
  });
}

export function isBookmarked(id: string) {
  const ybookmarks = getBookmarks(yjs.ydoc);
  return ybookmarks.toArray().includes(id);
}

export function handleBookmarkAdd(id: string) {
  const ypage = getPage(yjs.ydoc, id);
  const ybookmarks = getBookmarks(yjs.ydoc);
  ybookmarks.insert(ybookmarks.length, [ypage.get("id")]);
}

export function handleBookmarkRemove(id: string) {
  const ybookmarks = getBookmarks(yjs.ydoc);

  const index = ybookmarks.toArray().indexOf(id);
  if (index !== -1) {
    ybookmarks.delete(index, 1);
  }
}

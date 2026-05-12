import {
  createBlock,
  createCollection,
  createInsertBlock,
  createInsertBlockAfter,
  createPage,
  deleteBlock,
  getChildItemIndex,
  getItem,
  getItemParent,
  getItemSibling,
  insertItem,
  isRootItem,
  moveItem,
  moveItemAfter,
  moveItemBefore,
  type YBlockMap,
} from "esm-treero-api";
import localPreferencesManager from "../store/preferences";
import useZustandStore from "../store/useZustandStore";
import yjs from "../store/yjsManager";

export async function login(roomToken: string) {
  console.debug(`authorize`, roomToken);
  useZustandStore.setState({ authorized: true, newAccount: false });
  await localPreferencesManager.set({ roomToken: roomToken, authorized: true });
}

export function register() {
  console.debug(`register`);
  useZustandStore.setState({ authorized: true, newAccount: true });
}

export async function saveWsUrl(webSocketServerUrl: string) {
  console.debug(`saveWsUrl`, webSocketServerUrl);
  await localPreferencesManager.set({ webSocketServerUrl: webSocketServerUrl });
}

export async function openBlock(id: string) {
  console.debug(`openBlock`, id);
  useZustandStore.setState({ rootBlockId: id });
  await localPreferencesManager.set({ rootBlockId: id });
}

export function selectBlock(id: string, caretCharIndex: number) {
  useZustandStore.setState({ selectedBlockId: id, caretCharIndex: caretCharIndex });
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
    moveItem(yjs.ydoc, yjs.yblocks, id, ysibling.get("id"), -1);
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

export function handleSelectBlockUp(id: string) {
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

export function handleSelectBlockDown(id: string) {
  const ysibling = getItemSibling(yjs.yblocks, id, 1);
  if (ysibling) {
    selectBlock(ysibling.get("id"), 0);
  }
}

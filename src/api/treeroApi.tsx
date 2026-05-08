import { YjsManager } from "esm-treero-api";
import { nanoid } from "nanoid";
import yjs from "../store/yjsManager";
import localPreferencesManager from "../store/preferences";

const trApi = {
  version: "0.0.1",
  yjs: yjs,
  YjsManager: YjsManager,
  localPreferencesManager: localPreferencesManager,
  // useStore: useStore,

  async clearData(reload: boolean) {
    await localPreferencesManager.clear();
    await yjs.idbPersistence?.clearData();
    if (reload) {
      window.location.replace(window.location.href);
    }
  },

  generateRoomToken(): string {
    return nanoid(64);
  },

  // authorize(roomToken?: string) {
  //   if (roomToken) {
  //     LocalConfig.set({ roomToken: roomToken });
  //   }

  //   LocalConfig.set({ authorized: true });
  //   useStore.setState({ localConfig: LocalConfig.get() });
  // },

  // openBlock(blockId: string) {
  //   const block = Block.get(blockId);
  //   if (!block) return;
  //   const page = block.getPage();

  //   LocalConfig.set({ currentBlockId: blockId });
  //   LocalConfig.set({ currentPageId: page.id });

  //   useStore.setState({ localConfig: LocalConfig.get() });
  // },

  // indentBlock(blockId: string) {
  //   const block = Block.get(blockId);
  //   if (!block) return;
  //   const blockSibling = block.getSibling(-1);
  //   if (!blockSibling) return;
  //   YjsManager.getYjs().ydoc.transact(() => {
  //     block.move(blockSibling.id, -1);
  //     blockSibling.collapsed = false;
  //   });

  //   const el = document.querySelector(`.NodeContent-contenteditable[data-id="${blockId}"]`);
  //   if (el) {
  //     const index = TreeRoAPI.useStore.getState().getCharIndexFromCaret(el as HTMLElement);
  //     TreeRoAPI.useStore.getState().activateNode(blockId, index);
  //   }
  // },

  // unindentBlock(blockId: string) {
  //   const block = Block.get(blockId);
  //   if (!block) return;
  //   const blockParent = block.parent();
  //   if (!blockParent) return;
  //   block.moveAfter(blockParent.id);
  //   const el = document.querySelector(`.NodeContent-contenteditable[data-id="${blockId}"]`);
  //   if (el) {
  //     const index = TreeRoAPI.useStore.getState().getCharIndexFromCaret(el as HTMLElement);
  //     TreeRoAPI.useStore.getState().activateNode(blockId, index);
  //   }
  // },

  // moveBlockUp(blockId: string) {
  //   const block = Block.get(blockId);
  //   if (!block) return;
  //   const blockParent = block.parent();
  //   if (!blockParent) return;
  //   const index = block.getIndex();
  //   if (index !== -1) {
  //     block.move(blockParent.id, Math.max(0, index - 1));
  //   }
  // },

  // moveBlockDown(blockId: string) {
  //   const block = Block.get(blockId);
  //   if (!block) return;
  //   const blockParent = block.parent();
  //   if (!blockParent) return;
  //   const index = block.getIndex();
  //   if (index !== -1) {
  //     block.move(blockParent.id, index + 1);
  //   }
  // },

  // collapseCollection(collectionId: string, state: boolean | null = null) {
  //   const collection = Collection.get(collectionId);
  //   if (!collection || collection.children.length === 0) return;
  //   if (state === true) {
  //     collection.collapsed = true;
  //   } else if (state === false) {
  //     collection.collapsed = false;
  //   } else {
  //     collection.collapsed = !collection.collapsed;
  //   }
  // },

  // collapseBlock(blockId: string, state: boolean | null = null) {
  //   const block = Block.get(blockId);
  //   if (!block || block.children.length === 0) return;
  //   if (state === true) {
  //     block.collapsed = true;
  //   } else if (state === false) {
  //     block.collapsed = false;
  //   } else {
  //     block.collapsed = !block.collapsed;
  //   }
  // },

  // collapseBlockDescendants(blockId: string, state: boolean | null = null) {
  //   const block = Block.get(blockId);
  //   if (!block || block.children.length === 0) return;
  //   YjsManager.getYjs().ydoc.transact(() => {
  //     if (state === true) {
  //       block.collapsed = true;
  //     } else if (state === false) {
  //       block.collapsed = false;
  //     } else {
  //       block.collapsed = !block.collapsed;
  //     }
  //     for (const blockChild of block.getDescendants()) {
  //       if (state === true) {
  //         blockChild.collapsed = true;
  //       } else if (state === false) {
  //         blockChild.collapsed = false;
  //       } else {
  //         blockChild.collapsed = !blockChild.collapsed;
  //       }
  //     }
  //   });
  // },

  undo() {
    yjs.undoManager?.undo();
  },

  redo() {
    yjs.undoManager?.redo();
  },
};

declare global {
  interface Window {
    trApi: typeof trApi;
  }
}

window.trApi = trApi;

export default trApi;

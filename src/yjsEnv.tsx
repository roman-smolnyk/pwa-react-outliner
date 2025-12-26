import { diffChars } from "diff";
import { IndexeddbPersistence } from "y-indexeddb";
import * as Y from "yjs";
import type { YDocumentDataType, YGroupDataType, YMetaDataType, YNodeDataType } from "./types";
import { Conf } from "./config";
import { WebsocketProvider } from "y-websocket";
// import { YSweetProvider } from "@y-sweet/client";

// * To clear idb: idbPersistence.clearData()

class YMetaWrap {
  ymeta: YMetaDataType;
  constructor(ymeta: YMetaDataType) {
    this.ymeta = ymeta;
  }
  get root_group_id(): string | null {
    return this.ymeta.get("root_group_id");
  }
  set root_group_id(v: string) {
    this.ymeta.set("root_group_id", v);
  }
}

class YNodeWrap {
  ynode: YNodeDataType;

  constructor(ynode: YNodeDataType) {
    this.ynode = ynode;
  }
  get node_id(): string {
    return this.ynode.get("node_id");
  }
  get parent_id(): string | null {
    return this.ynode.get("parent_id");
  }
  set parent_id(v: string) {
    this.ynode.set("parent_id", v);
  }
  get content(): Y.Text {
    return this.ynode.get("content");
  }
  set content(v: string) {
    const ytext = this.ynode.get("content");
    const oldText = ytext.toString();
    const diff = diffChars(oldText, v);

    let index = 0;
    // console.debug(`YNode.content -> diff`, diff);
    Yjs.ydoc?.transact(() => {
      for (const part of diff) {
        if (part.removed) {
          // remove this many chars from current index
          ytext.delete(index, part.value.length);
        } else if (part.added) {
          // insert at current index
          ytext.insert(index, part.value);
          index += part.value.length;
        } else {
          // unchanged segment
          index += part.value.length;
        }
      }
    });
  }
  get collapsed(): boolean {
    return this.ynode.get("collapsed");
  }
  set collapsed(v: boolean) {
    this.ynode.set("collapsed", v);
  }
  get created(): number {
    return this.ynode.get("created");
  }
  get modified(): number {
    return this.ynode.get("modified");
  }
  set modified(v: number) {
    this.ynode.set("modified", v);
  }
  get children(): Y.Array<string> {
    return this.ynode.get("children");
  }
  static get(id: string): YNodeWrap | null {
    const ynode = Yjs.ynodes?.get(id);
    return ynode ? new YNodeWrap(ynode) : null;
  }
}

class YDocumentWrap {
  ydocument: YDocumentDataType;

  constructor(ydocument: YDocumentDataType) {
    this.ydocument = ydocument;
  }
  get document_id(): string {
    return this.ydocument.get("document_id");
  }
  get root_node_id(): string {
    return this.ydocument.get("root_node_id");
  }
  set root_node_id(v: string) {
    this.ydocument.set("root_node_id", v);
  }
  static get(id: string): YDocumentWrap | null {
    const ydocument = Yjs.ydocuments?.get(id);
    return ydocument ? new YDocumentWrap(ydocument) : null;
  }
}

class YGroupWrap {
  ygroup: YGroupDataType;

  constructor(ygroup: YGroupDataType) {
    this.ygroup = ygroup;
  }
  get group_id(): string {
    return this.ygroup.get("group_id");
  }
  get name(): string {
    return this.ygroup.get("name");
  }
  set name(v: string) {
    this.ygroup.set("name", v);
  }
  get collapsed(): boolean {
    return this.ygroup.get("collapsed");
  }
  set collapsed(v: boolean) {
    this.ygroup.set("collapsed", v);
  }
  get children(): Y.Array<string> {
    return this.ygroup.get("children");
  }
  static get(id: string): YGroupWrap | null {
    const ygroup = Yjs.ygroups?.get(id);
    return ygroup ? new YGroupWrap(ygroup) : null;
  }
}

export const Yjs = {
  setup: () => {
    Yjs.ydoc = new Y.Doc();

    Yjs.ymeta = Yjs.ydoc.getMap("ymeta") as YMetaDataType;
    Yjs.ygroups = Yjs.ydoc.getMap("groups") as Y.Map<YGroupDataType>;
    Yjs.ydocuments = Yjs.ydoc.getMap("documents") as Y.Map<YDocumentDataType>;
    Yjs.ynodes = Yjs.ydoc.getMap("nodes") as Y.Map<YNodeDataType>;

    // * undoManager supports differensiation by origins: new Y.UndoManager(ydoc, { trackedOrigins: ["user"] }) , ydoc.transact(callback, "user")
    Yjs.undoManager = new Y.UndoManager(Yjs.ydoc);

    Yjs.idbPersistence = new IndexeddbPersistence("TreeRo-db", Yjs.ydoc);
  },

  applyBackup: async (update: Uint8Array) => {
    await Yjs.idbPersistence?.clearData();

    Yjs.ydoc = new Y.Doc();

    // * undoManager supports differensiation by origins: new Y.UndoManager(ydoc, { trackedOrigins: ["user"] }) , ydoc.transact(callback, "user")
    Yjs.undoManager = new Y.UndoManager(Yjs.ydoc);

    Yjs.idbPersistence = new IndexeddbPersistence("TreeRo-db", Yjs.ydoc);

    Yjs.ymeta = Yjs.ydoc.getMap("ymeta") as YMetaDataType;
    Yjs.ygroups = Yjs.ydoc.getMap("groups") as Y.Map<YGroupDataType>;
    Yjs.ydocuments = Yjs.ydoc.getMap("documents") as Y.Map<YDocumentDataType>;
    Yjs.ynodes = Yjs.ydoc.getMap("nodes") as Y.Map<YNodeDataType>;

    Yjs.idbPersistence.whenSynced.then(() => {
      Y.applyUpdate(Yjs.ydoc!, update);
    });
  },

  connectWebSocket: (roomname: string) => {
    const wsProvider = new WebsocketProvider(Conf.WS_SERVER, roomname, Yjs.ydoc!);
    Yjs.wsProvider = wsProvider;
  },

  Y: Y,
  ydoc: null as Y.Doc | null,
  ymeta: null as YMetaDataType | null,
  ynodes: null as Y.Map<YNodeDataType> | null,
  ydocuments: null as Y.Map<YDocumentDataType> | null,
  ygroups: null as Y.Map<YGroupDataType> | null,

  undoManager: null as Y.UndoManager | null,

  idbPersistence: null as IndexeddbPersistence | null,
  wsProvider: null as WebsocketProvider | null,

  YMetaWrap: YMetaWrap,
  YNodeWrap: YNodeWrap,
  YDocumentWrap: YDocumentWrap,
  YGroupWrap: YGroupWrap,
};

// collaboration
// export const wsProvider = new WebsocketProvider(WS_URL, ROOM_NAME, ydoc);
// export const awareness = wsProvider.awareness;

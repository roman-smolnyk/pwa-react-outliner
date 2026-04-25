import { Block, Collection, Page, Workspace, YjsManager, type YBlockMap, type YCollectionMap, type YPageMap } from "esm-treero-api";
import { TreeRoAPI } from "./apis/treeroApi";
import { Conf } from "./appConfig";
import { fillInMockupData } from "./etc/mockupData";
import { LocalConfig } from "./localConfig";
// import { createWelcomeDocument } from "./etc/welcomeData";
import { useStore } from "./stateStore";
// import type { YBlockMap, YCollectionMap, YPageMap, YWorkspaceMap } from "esm-treero-api";
import type { BlockState, CollectionState, PageState, WorkspaceState } from "./types";
// import { fillInMockupData } from "./etc/mockupData";
import * as Y from "yjs";

export default async function onStartUp() {
  console.debug(`onStartUp`);
  YjsManager.initializeYjs();
  YjsManager.addIndexeddbPersistence();
  YjsManager.addUndoManager();

  const Yjs = YjsManager.getYjs();

  Yjs.idbPersistence!.whenSynced.then(() => {
    // console.debug("persistence.whenSynced.then");
    let roomToken = LocalConfig.get().roomToken;
    const workspaceId = LocalConfig.get().workspaceId;
    let workspace: Workspace;
    // console.debug("ymeta", ymeta.toJSON());
    // New Account
    console.debug(`onStartUp:roomToken`, roomToken);
    if (!roomToken) {
      roomToken = TreeRoAPI.generateRoomToken();
      workspace = Workspace.createNew();
      // createWelcomeDocument();
      fillInMockupData(workspace);

      LocalConfig.set({ roomToken: roomToken, workspaceId: workspace.id });
    } else if (workspaceId) {
      workspace = Workspace.get(workspaceId);
    } else {
      // SHOULD THROW AN ERROR
      workspace = new Workspace("zebra");
    }

    Yjs.undoManager!.clear();

    let isWsOn = true;
    if (import.meta.env.DEV && !Conf.WS_IS_ON) {
      isWsOn = false;
    }

    if (isWsOn) {
      YjsManager.addWebsocketProvider("https://y-websocket-server-t1tj.onrender.com", roomToken);
      Yjs.wsProvider!.on("status", (e) => {
        // console.debug("WebsocketProvider status", e.status);
        if (e.status === "connecting") {
          useStore.setState({ wsStatus: "connecting" });
        } else if (e.status === "connected") {
          useStore.setState({ wsStatus: "connected" });
        } else if (e.status === "disconnected") {
          useStore.setState({ wsStatus: "disconnected" });
        }
      });
    } else {
      useStore.setState({ wsStatus: "turned off" });
    }

    // Yjs.ydoc.on("update", (arg0, arg1, arg2, arg3) => {
    //   console.log(`Yjs.ydoc.on("update")`, arg0, arg1, arg2, arg3);
    // });

    // const allRootTypes = Object.values(Yjs.ydoc.share);
    // Yjs.undoManager.addToScope(allRootTypes);

    useStore.setState({
      stateIsInitialized: true,
      localConfig: LocalConfig.get(),
      workspace: workspace.yworkspace!.toJSON() as WorkspaceState,
      collections: new Map(Object.entries(Yjs.ycollections.toJSON())) as Map<string, CollectionState>,
      pages: new Map(Object.entries(Yjs.ypages.toJSON())) as Map<string, PageState>,
      blocks: new Map(Object.entries(Yjs.yblocks.toJSON())) as Map<string, BlockState>,
    });

    startStateUpdaterViaYjsObserver();
  });
}

function startStateUpdaterViaYjsObserver() {
  // ########################### Nodes ##################################

  const Yjs = YjsManager.getYjs();
  Yjs.yblocks.observeDeep((events) => {
    // when nested Y.Array or, Y.Text changes, two events are fired, for themself and for parent Y.Map
    // console.debug("ynodes.observeDeep", events);
    for (const event of events) {
      // console.debug("event.changes.added", event.changes.added);
      // console.debug("event.changes.deleted", event.changes.deleted);
      // console.debug("event.changes.delta", event.changes.delta);
      // console.debug("event.changes.keys", event.changes.keys);
      for (const [key, change] of event.changes.keys) {
        if (change.action === "add") {
          const block = Block.get(key);
          // console.debug("add", key, ynode?.ynode.toJSON(), change.oldValue);
          if (block) {
            useStore.setState((state) => {
              const uBlocks = new Map(state.blocks);
              uBlocks.set(block.id, block.yblock.toJSON() as BlockState);
              return { blocks: uBlocks };
            });
          } else {
            console.debug(`Why you are here? [yblocks]`, key, change);
          }
        } else if (change.action === "delete") {
          // console.debug("delete", key, change.oldValue);
          useStore.setState((state) => {
            const uBlocks = new Map(state.blocks);
            uBlocks.delete(key);
            return { blocks: uBlocks };
          });
        } else if (change.action === "update") {
          // console.debug("update", key, change.oldValue);
        }
      }
      if (event.target instanceof Y.Text) {
        // node text changed
        // @ts-ignore
        const yblock = event.target.parent as YBlockMap;
        // console.debug("Y.Text", event.target.toJSON(), ynode.toJSON());
        useStore.setState((state) => {
          const uBlocks = new Map(state.blocks);
          uBlocks.set(yblock.get("block_id"), yblock.toJSON() as BlockState);
          // console.debug("Update", ynode.get("node_id"));
          return { blocks: uBlocks };
        });
      } else if (event.target instanceof Y.Array) {
        // node array changed
        // @ts-ignore
        const yblock = event.target.parent as YBlockMap;
        // console.debug("Y.Array", event.target.toJSON(), ynode.toJSON());
        useStore.setState((state) => {
          const uBlocks = new Map(state.blocks);
          uBlocks.set(yblock.get("block_id"), yblock.toJSON() as BlockState);
          return { blocks: uBlocks };
        });
      } else if (event.target instanceof Y.Map) {
        if (!event.target.parent) {
          // This is root ynodes
          continue;
        }
        // @ts-ignore
        const yblock = event.target as YBlockMap;
        useStore.setState((state) => {
          const uBlocks = new Map(state.blocks);
          uBlocks.set(yblock.get("block_id"), yblock.toJSON() as BlockState);
          return { blocks: uBlocks };
        });

        // console.debug("Y.Map", Boolean(event.target.parent), event.target.toJSON(), ynode?.toJSON());
      } else {
        // console.debug("ELSE", event.target.toJSON());
      }
    }
  });

  // ########################### Groups ##################################

  Yjs.ycollections.observeDeep((events) => {
    // console.debug("ygroups.observeDeep", events);
    for (const event of events) {
      // console.debug("event.changes.added", event.changes.added);
      // console.debug("event.changes.deleted", event.changes.deleted);
      // console.debug("event.changes.delta", event.changes.delta);
      // console.debug("event.changes.keys", event.changes.keys);
      for (const [key, change] of event.changes.keys) {
        if (change.action === "add") {
          const ycollection = Collection.get(key);
          // console.debug("add", key, ygroup?.ygroup.toJSON(), change.oldValue);
          if (ycollection) {
            useStore.setState((state) => {
              const uCollections = new Map(state.collections);
              uCollections.set(ycollection.id, ycollection.ycollection.toJSON() as CollectionState);
              return { collections: uCollections };
            });
          }
        } else if (change.action === "delete") {
          // console.debug("delete", key, change.oldValue);
          useStore.setState((state) => {
            const uCollections = new Map(state.collections);
            uCollections.delete(key);
            return { collections: uCollections };
          });
        } else if (change.action === "update") {
          // console.debug("update", key, change.oldValue);
        }
      }
      if (event.target instanceof Y.Array) {
        // node array changed
        // @ts-ignore
        const ycollection = event.target.parent as YCollectionMap;
        // console.debug("Y.Array", event.target.toJSON(), ygroup.toJSON());
        useStore.setState((state) => {
          const uCollections = new Map(state.collections);
          uCollections.set(ycollection.get("collection_id"), ycollection.toJSON() as CollectionState);
          return { collections: uCollections };
        });
      } else if (event.target instanceof Y.Map) {
        if (!event.target.parent) {
          // This is root ygroups
          continue;
        }
        // @ts-ignore
        const ycollection = event.target as YCollectionMap;
        useStore.setState((state) => {
          const uCollections = new Map(state.collections);
          uCollections.set(ycollection.get("collection_id"), ycollection.toJSON() as CollectionState);
          return { collections: uCollections };
        });

        // console.debug("Y.Map", Boolean(event.target.parent), event.target.toJSON(), ygroup?.toJSON());
      } else {
        // console.debug("ELSE", event.target.toJSON());
      }
    }
  });

  // ########################### Documents ##################################

  Yjs.ypages.observeDeep((events) => {
    // console.debug("ydocuments.observeDeep", events);
    for (const event of events) {
      // console.debug("event.changes.added", event.changes.added);
      // console.debug("event.changes.deleted", event.changes.deleted);
      // console.debug("event.changes.delta", event.changes.delta);
      // console.debug("event.changes.keys", event.changes.keys);
      for (const [key, change] of event.changes.keys) {
        if (change.action === "add") {
          const ypage = Page.get(key);
          // console.debug("add", key, ydocument?.ydocument.toJSON(), change.oldValue);
          if (ypage) {
            useStore.setState((state) => {
              const uPages = new Map(state.pages);
              uPages.set(ypage.id, ypage.ypage.toJSON() as PageState);
              return { pages: uPages };
            });
          }
        } else if (change.action === "delete") {
          // console.debug("delete", key, change.oldValue);
          useStore.setState((state) => {
            const uPages = new Map(state.pages);
            uPages.delete(key);
            return { pages: uPages };
          });
        } else if (change.action === "update") {
          // console.debug("update", key, change.oldValue);
        }
      }
      if (event.target instanceof Y.Map) {
        if (!event.target.parent) {
          // This is root ygroups
          continue;
        }
        // @ts-ignore
        const ypage = event.target as YPageMap;
        useStore.setState((state) => {
          const uPages = new Map(state.pages);
          uPages.set(ypage.get("page_id"), ypage.toJSON() as PageState);
          return { pages: uPages };
        });

        // console.debug("Y.Map", Boolean(event.target.parent), event.target.toJSON(), ydocument?.toJSON());
      } else {
        // console.debug("ELSE", event.target.toJSON());
      }
    }
  });

  // ########################### META ##################################

  Yjs.yworkspaces.observeDeep((_events) => {
    // TODO:
    console.debug("ymeta.observeDeep", _events);
    // useStore.setState((_state) => {
    //   const root_group_id = new Workspace().rootCollectionId;
    //   const inbox_node_id = new Workspace().inboxBlockId;
    //   return { meta: { root_group_id: root_group_id, inbox_node_id } };
    // });
  });
}

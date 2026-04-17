import { TreeRoAPI } from "./apis/treeroApi";
import { LocalConfig } from "./localConfig";
import { Block, Page, Collection, Workspace, YjsManager } from "esm-treero-api";
import { Conf } from "./appConfig";
import { fillInMockupData } from "./etc/mockupData";
// import { createWelcomeDocument } from "./etc/welcomeData";
import { useStore } from "./stateStore";
// import type { YBlockMap, YCollectionMap, YPageMap, YWorkspaceMap } from "esm-treero-api";
import type { BlockState, WorkspaceState, PageState, CollectionState } from "./types";
// import { fillInMockupData } from "./etc/mockupData";

export default async function onStartUp() {
  console.debug(`onStartUp`);
  YjsManager.initializeYjs();
  YjsManager.addIndexeddbPersistence();
  YjsManager.addUndoManager();

  const Yjs = YjsManager.getYjs();

  Yjs.idbPersistence!.whenSynced.then(() => {
    // console.debug("persistence.whenSynced.then");
    let roomToken = LocalConfig.get().roomToken;
    let workspaceId = LocalConfig.get().workspaceId;
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

    // startStateUpdaterViaYjsObserver();
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
              const uNodes = new Map(state.blocks);
              uNodes.set(block.id, block.yblock.toJSON() as BlockState);
              return { blocks: uNodes };
            });
          }
        } else if (change.action === "delete") {
          // console.debug("delete", key, change.oldValue);
          useStore.setState((state) => {
            const uNodes = new Map(state.nodes);
            uNodes.delete(key);
            return { nodes: uNodes };
          });
        } else if (change.action === "update") {
          // console.debug("update", key, change.oldValue);
        }
      }
      if (event.target instanceof Y.Text) {
        // node text changed
        const ynode = event.target.parent as YNodeDataType;
        // console.debug("Y.Text", event.target.toJSON(), ynode.toJSON());
        useStore.setState((state) => {
          const uNodes = new Map(state.nodes);
          uNodes.set(ynode.get("node_id"), ynode.toJSON() as NodeDataType);
          // console.debug("Update", ynode.get("node_id"));
          return { nodes: uNodes };
        });
      } else if (event.target instanceof Y.Array) {
        // node array changed
        const ynode = event.target.parent as YNodeDataType;
        // console.debug("Y.Array", event.target.toJSON(), ynode.toJSON());
        useStore.setState((state) => {
          const uNodes = new Map(state.nodes);
          uNodes.set(ynode.get("node_id"), ynode.toJSON() as NodeDataType);
          return { nodes: uNodes };
        });
      } else if (event.target instanceof Y.Map) {
        if (!event.target.parent) {
          // This is root ynodes
          continue;
        }
        const ynode = event.target as YNodeDataType;
        useStore.setState((state) => {
          const uNodes = new Map(state.nodes);
          uNodes.set(ynode.get("node_id"), ynode.toJSON() as NodeDataType);
          return { nodes: uNodes };
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
          const ygroup = Collection.get(key);
          // console.debug("add", key, ygroup?.ygroup.toJSON(), change.oldValue);
          if (ygroup) {
            useStore.setState((state) => {
              const uGroups = new Map(state.groups);
              uGroups.set(ygroup.id, ygroup.ycollection.toJSON() as GroupDataType);
              return { groups: uGroups };
            });
          }
        } else if (change.action === "delete") {
          // console.debug("delete", key, change.oldValue);
          useStore.setState((state) => {
            const uGroups = new Map(state.groups);
            uGroups.delete(key);
            return { groups: uGroups };
          });
        } else if (change.action === "update") {
          // console.debug("update", key, change.oldValue);
        }
      }
      if (event.target instanceof Y.Array) {
        // node array changed
        const ygroup = event.target.parent as YGroupDataType;
        // console.debug("Y.Array", event.target.toJSON(), ygroup.toJSON());
        useStore.setState((state) => {
          const uGroups = new Map(state.groups);
          uGroups.set(ygroup.get("group_id"), ygroup.toJSON() as GroupDataType);
          return { groups: uGroups };
        });
      } else if (event.target instanceof Y.Map) {
        if (!event.target.parent) {
          // This is root ygroups
          continue;
        }
        const ygroup = event.target as YGroupDataType;
        useStore.setState((state) => {
          const uGroups = new Map(state.groups);
          uGroups.set(ygroup.get("group_id"), ygroup.toJSON() as GroupDataType);
          return { groups: uGroups };
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
          const ydocument = Page.get(key);
          // console.debug("add", key, ydocument?.ydocument.toJSON(), change.oldValue);
          if (ydocument) {
            useStore.setState((state) => {
              const uDocuments = new Map(state.documents);
              uDocuments.set(ydocument.id, ydocument.ypage.toJSON() as DocumentDataType);
              return { documents: uDocuments };
            });
          }
        } else if (change.action === "delete") {
          // console.debug("delete", key, change.oldValue);
          useStore.setState((state) => {
            const uDocuments = new Map(state.documents);
            uDocuments.delete(key);
            return { documents: uDocuments };
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
        const ydocument = event.target as YDocumentDataType;
        useStore.setState((state) => {
          const uDocuments = new Map(state.documents);
          uDocuments.set(ydocument.get("document_id"), ydocument.toJSON() as DocumentDataType);
          return { documents: uDocuments };
        });

        // console.debug("Y.Map", Boolean(event.target.parent), event.target.toJSON(), ydocument?.toJSON());
      } else {
        // console.debug("ELSE", event.target.toJSON());
      }
    }
  });

  // ########################### META ##################################

  Yjs.yworkspace.observeDeep((_events) => {
    // console.debug("ymeta.observeDeep", events);
    useStore.setState((_state) => {
      const root_group_id = new Workspace().rootCollectionId;
      const inbox_node_id = new Workspace().inboxBlockId;
      return { meta: { root_group_id: root_group_id, inbox_node_id } };
    });
  });
}

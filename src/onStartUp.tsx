import { WS_IS_ON, WS_SERVER_URL } from "./config/appConfig";
import { fillInMockupData } from "./etc/mockupData";
import localConfigManager from "./config/localConfigManager";
// import { createWelcomeDocument } from "./etc/welcomeData";
// import { useStore } from "./stateStore";
// import type { YBlockMap, YCollectionMap, YPageMap, YAccountMap } from "esm-treero-api";
// import { fillInMockupData } from "./etc/mockupData";

import trApi from "./api/treeroApi";

import yjs from "./store/yjsManager";

import { initNewYjsData } from "esm-treero-api";

let startupPromise: Promise<void> | null = null;
export default function onStartUp(callback: CallableFunction) {
  console.debug(`onStartUp`);
  if (startupPromise) {
    return startupPromise;
  }

  startupPromise = (async () => {
    console.debug(`onStartUp startupPromise`);

    localConfigManager.clear();
    trApi.clearData(false);

    yjs.addIndexeddbPersistence();
    yjs.addUndoManager();

    yjs.idbPersistence!.whenSynced.then(() => {
      console.debug("persistence.whenSynced.then");
      let roomToken = localConfigManager.get().roomToken;
      console.debug("roomToken", roomToken);
      // New Account
      console.debug(`onStartUp:roomToken`, roomToken);
      if (!roomToken) {
        roomToken = trApi.generateRoomToken();
        initNewYjsData(yjs);
        // createWelcomeDocument();
        fillInMockupData(yjs);
        localConfigManager.set({ roomToken: roomToken });
        console.debug("localConfig", localConfigManager.get());
      }

      yjs.undoManager!.clear();

      let isWsOn = true;
      if (import.meta.env.DEV && !WS_IS_ON) {
        isWsOn = false;
      }

      if (isWsOn) {
        yjs.addWebsocketProvider(WS_SERVER_URL, roomToken);
        yjs.wsProvider!.on("status", (e) => {
          // console.debug("WebsocketProvider status", e.status);
          // if (e.status === "connecting") {
          //   useStore.setState({ wsStatus: "connecting" });
          // } else if (e.status === "connected") {
          //   useStore.setState({ wsStatus: "connected" });
          // } else if (e.status === "disconnected") {
          //   useStore.setState({ wsStatus: "disconnected" });
          // }
        });
      } else {
        // useStore.setState({ wsStatus: "turned off" });
      }

      callback();

      // Yjs.ydoc.on("update", (arg0, arg1, arg2, arg3) => {
      //   console.log(`Yjs.ydoc.on("update")`, arg0, arg1, arg2, arg3);
      // });

      // const allRootTypes = Object.values(Yjs.ydoc.share);
      // Yjs.undoManager.addToScope(allRootTypes);

      // useStore.setState({
      //   stateIsInitialized: true,
      //   localConfig: LocalConfig.get(),
      //   account: Yjs.yaccount.toJSON() as AccountState,
      //   collections: new Map(Object.entries(Yjs.ycollections.toJSON())) as Map<string, CollectionState>,
      //   pages: new Map(Object.entries(Yjs.ypages.toJSON())) as Map<string, PageState>,
      //   blocks: new Map(Object.entries(Yjs.yblocks.toJSON())) as Map<string, BlockState>,
      // });
    });
  })();

  return startupPromise;
}

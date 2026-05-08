import { WS_IS_ON, WS_SERVER_URL } from "../config.tsx";
import { fillInMockupData } from "./etc/mockupData";
// import { createWelcomeDocument } from "./etc/welcomeData";
// import { useStore } from "./stateStore";
// import type { YBlockMap, YCollectionMap, YPageMap, YAccountMap } from "esm-treero-api";
// import { fillInMockupData } from "./etc/mockupData";

import trApi from "./api/treeroApi";

import yjs from "./store/yjsManager";

import { initNewYjsData } from "esm-treero-api";
import localPreferencesManager from "./store/preferences.tsx";
import { login } from "./api/api.tsx";
import useZustandStore from "./store/useZustandStore.tsx";

let startupPromise: Promise<void> | null = null;
export default function onStartUp(callback: CallableFunction) {
  console.debug(`onStartUp`);
  if (startupPromise) {
    return startupPromise;
  }

  startupPromise = (async () => {
    console.debug(`onStartUp startupPromise`);

    // trApi.clearData(false);

    yjs.addIndexeddbPersistence();
    yjs.addUndoManager();

    yjs.idbPersistence!.whenSynced.then(async () => {
      console.debug("persistence.whenSynced.then");
      let { roomToken, newAccount } = useZustandStore.getState();
      console.debug(`newAccount`, newAccount);
      // New Account
      let newRoomToken = "";
      if (newAccount) {
        initNewYjsData(yjs);
        // createWelcomeDocument();
        await fillInMockupData(yjs);
        newRoomToken = trApi.generateRoomToken();
        await login(newRoomToken);
      }

      console.debug("roomToken", roomToken, "newRoomToken", newRoomToken);

      if (!roomToken && !newRoomToken) {
        throw new Error(`roomToken is missing`);
      }

      yjs.undoManager!.clear();

      let isWsOn = true;
      if (import.meta.env.DEV && !WS_IS_ON) {
        isWsOn = false;
      }

      if (isWsOn) {
        yjs.addWebsocketProvider(WS_SERVER_URL, newRoomToken ? newRoomToken : (roomToken as string));
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
      //   localPref: await localPreferencesManager.get(),
      //   account: Yjs.yaccount.toJSON() as AccountState,
      //   collections: new Map(Object.entries(Yjs.ycollections.toJSON())) as Map<string, CollectionState>,
      //   pages: new Map(Object.entries(Yjs.ypages.toJSON())) as Map<string, PageState>,
      //   blocks: new Map(Object.entries(Yjs.yblocks.toJSON())) as Map<string, BlockState>,
      // });
    });
  })();

  return startupPromise;
}

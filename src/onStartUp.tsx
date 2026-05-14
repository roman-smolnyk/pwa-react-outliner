import { initNewYjsData } from "esm-treero-api";
import { WS_IS_ON } from "../config.tsx";
import { fillInMockupData } from "./etc/mockupData";
import useZustandStore from "./store/useZustandStore.tsx";
import yjs from "./store/yjsManager";

let startupPromise: Promise<void> | null = null;
export default function onStartUp(callback: CallableFunction) {
  console.debug(`onStartUp`);
  if (startupPromise) {
    return startupPromise;
  }

  startupPromise = (async () => {
    console.debug(`onStartUp startupPromise`);

    // clearAllData;

    yjs.addIndexeddbPersistence();
    yjs.addUndoManager();

    yjs.idbPersistence!.whenSynced.then(async () => {
      console.debug("persistence.whenSynced.then");

      const { roomToken, isNewAccount, webSocketServerUrl } = useZustandStore.getState();
      console.debug(`isNewAccount`, isNewAccount);

      if (!roomToken) {
        throw new Error(`roomToken is missing`);
      }

      if (isNewAccount) {
        initNewYjsData(yjs);
        // createWelcomeDocument();
        await fillInMockupData(yjs);
        useZustandStore.setState({ isNewAccount: false });
      }

      yjs.undoManager!.clear();

      let isWsOn = true;
      if (import.meta.env.DEV && !WS_IS_ON) {
        isWsOn = false;
      }
      if (isWsOn && webSocketServerUrl) {
        console.debug("Connecting... webSocketServerUrl", webSocketServerUrl);
        yjs.addWebsocketProvider(webSocketServerUrl, roomToken);
        yjs.wsProvider!.on("status", (e) => {
          console.debug("WebsocketProvider status", e.status);
          if (e.status === "connecting") {
            useZustandStore.setState({ webSocketConnectionStatus: "connecting" });
          } else if (e.status === "connected") {
            useZustandStore.setState({ webSocketConnectionStatus: "connected" });
          } else if (e.status === "disconnected") {
            useZustandStore.setState({ webSocketConnectionStatus: "disconnected" });
          }
        });
      } else {
        useZustandStore.setState({ webSocketConnectionStatus: "turned off" });
      }

      callback();

      // const allRootTypes = Object.values(Yjs.ydoc.share);
      // Yjs.undoManager.addToScope(allRootTypes);
    });
  })();

  return startupPromise;
}

import { createNewAccount } from "esm-treero-api";
import { WS_IS_ON } from "../config.tsx";
import { fillInMockupData } from "./etc/mockupData";
import useZustandStore from "./store/useZustandStore.tsx";
import yjs from "./store/yjsManager";
import { sleep, waitUntil } from "./utils/utilities.tsx";

declare const __APP_VERSION__: string;

let startupPromise: Promise<void> | null = null;
export default function onStartUp(callback: CallableFunction) {
  console.debug(`onStartUp`);
  if (startupPromise) {
    console.error(`onStartUp called again`);
    callback();
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
        console.debug(`createNewAccount`);
        createNewAccount(yjs, __APP_VERSION__);
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

      console.debug("onStartUp:waitUntil rootCollectionId");
      const rootCollectionId = await waitUntil(() => yjs.yaccount.get("root_id"), 30 * 1000);
      if (!rootCollectionId) {
        if (isNewAccount) {
          useZustandStore.setState({
            loadingScreenInfo: "Something went wrong.",
          });
        } else {
          useZustandStore.setState({
            loadingScreenInfo: "Loading data from remote failed. Please make sure that your second device is online and you used valid token.",
          });
        }
        useZustandStore.setState({ isLoadingScreenShowExit: true });
        return;
      }

      callback();

      // const allRootTypes = Object.values(Yjs.ydoc.share);
      // Yjs.undoManager.addToScope(allRootTypes);
    });
  })();

  return startupPromise;
}

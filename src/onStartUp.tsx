import { createNewAccount } from "esm-treero-api";
import log from 'loglevel';
import { WS_IS_ON } from "../config.tsx";
import { fillInMockupData } from "./etc/mockupData";
import useZustandStore from "./store/useZustandStore.tsx";
import yjs from "./store/yjsManager";
import { waitUntil } from "./utils/utilities.tsx";

declare const __APP_VERSION__: string;

let startupPromise: Promise<void> | null = null;
export default function onStartUp() {
  log.debug(`onStartUp`);
  if (startupPromise) {
    log.warn(`onStartUp called again`);
    return startupPromise;
  }

  startupPromise = (async () => {
    log.debug(`onStartUp startupPromise`);

    // clearAllData;

    yjs.addIndexeddbPersistence();
    yjs.addUndoManager();

    yjs.idbPersistence!.whenSynced.then(async () => {
      log.debug("persistence.whenSynced.then");

      const { roomToken, isNewAccount, webSocketServerUrl } = useZustandStore.getState();
      log.debug(`isNewAccount`, isNewAccount);

      if (!roomToken) {
        throw new Error(`roomToken is missing`);
      }

      if (isNewAccount) {
        log.debug(`createNewAccount`);
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
        log.debug("Connecting... webSocketServerUrl", webSocketServerUrl);
        yjs.addWebsocketProvider(webSocketServerUrl, roomToken);
        yjs.wsProvider!.on("status", (e) => {
          log.debug("WebsocketProvider status", e.status);
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

      log.debug("onStartUp:waitUntil rootCollectionId");
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

      useZustandStore.setState({ isDataLoaded: true });
      log.debug("isDataLoaded", true);

      // const allRootTypes = Object.values(Yjs.ydoc.share);
      // Yjs.undoManager.addToScope(allRootTypes);
    });
  })();

  return startupPromise;
}

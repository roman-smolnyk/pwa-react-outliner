import { createNewAccount } from "esm-treero-api";
import log from "loglevel";
import { listenWebSocketStatus } from "./api/api.tsx";
import { fillInMockupData } from "./utils/mockupData.tsx";
import useStore from "./store/useStore.tsx";
import yjs from "./store/yjsManager";
import { waitUntil } from "./utils/utilities.tsx";
import { createWelcomeData } from "./utils/welcomeData.tsx";

let startupPromise: Promise<void> | null = null;
export default function onStartUp() {
  log.debug(`onStartUp`);
  if (startupPromise) {
    log.warn(`onStartUp called again`);
    return startupPromise;
  }

  startupPromise = (async () => {
    log.debug(`onStartUp startupPromise`);

    yjs.addIndexeddbPersistence();
    // yjs.idbPersistence.on("synced", () => {})
    yjs.idbPersistence!.whenSynced.then(async () => {
      log.debug("persistence.whenSynced.then");

      const { roomToken, isNewAccount, isWebSocketServerOn, webSocketServerUrl } = useStore.getState();
      log.debug(`isNewAccount`, isNewAccount);

      if (!roomToken) {
        throw new Error(`roomToken is missing`);
      }

      if (isNewAccount) {
        log.debug(`createNewAccount`);
        createNewAccount(yjs);

        if (import.meta.env.DEV) {
          await fillInMockupData(yjs);
        } else {
          await createWelcomeData(yjs);
        }

        useStore.setState({ isNewAccount: false });
      }

      // yjs.undoManager!.clear();
      yjs.addUndoManager();

      yjs.addWebsocketProvider(webSocketServerUrl, roomToken, { connect: isWebSocketServerOn });
      listenWebSocketStatus();

      log.debug("onStartUp:waitUntil rootCollectionId");
      const rootCollectionId = await waitUntil(() => yjs.yaccount.get("root_id"), 30 * 1000);
      if (!rootCollectionId) {
        if (isNewAccount) {
          useStore.setState({
            loadingScreenInfo: "Something went wrong.",
          });
        } else {
          useStore.setState({
            loadingScreenInfo: "Loading data from remote failed. Please make sure that your second device is online and you used valid token.",
          });
        }
        useStore.setState({ shouldShowLoadingScreenExit: true });
        return;
      }

      useStore.setState({ isDataLoaded: true });
      log.debug("isDataLoaded", true);

      // const allRootTypes = Object.values(Yjs.ydoc.share);
      // Yjs.undoManager.addToScope(allRootTypes);
    });
  })();

  return startupPromise;
}

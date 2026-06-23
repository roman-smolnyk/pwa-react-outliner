import { createNewAccount } from "esm-treero-api";
import log from "loglevel";
import { listenWebSocketStatus, setWebSocketServer } from "./api/api.tsx";
import useStore from "./store/useStore.tsx";
import yjs from "./store/yjsManager";
import { fillInMockupData } from "./utils/mockupData.tsx";
import { waitUntil } from "./utils/utilities.ts";
import { createWelcomeData } from "./utils/welcomeData.tsx";

let startupPromise: Promise<void> | null = null;
export default function onStartUp() {
  log.debug(`onStartUp`);
  if (startupPromise) {
    log.warn(`onStartUp called again`);
    return startupPromise;
  }

  startupPromise = (async () => {
    log.debug(`onStartUp:startupPromise`);

    yjs.addIndexeddbPersistence();
    // yjs.idbPersistence.on("synced", () => {})
    yjs.idbPersistence!.whenSynced.then(async () => {
      log.debug("persistence.whenSynced.then");

      const { roomToken, isNewAccount, webSocketServerUrl, username } = useStore.getState();
      log.debug(`isNewAccount`, isNewAccount);

      if (!roomToken) {
        throw new Error(`roomToken is missing`);
      }

      if (isNewAccount) {
        log.debug(`createNewAccount`);
        createNewAccount(yjs, username);
        await setWebSocketServer({ isWebSocketServerOn: false });

        if (import.meta.env.DEV) {
          await fillInMockupData(yjs);
          // await createWelcomeData(yjs);
        } else {
          await fillInMockupData(yjs);
          // await createWelcomeData(yjs);
        }

        useStore.setState({ isNewAccount: false });
      }

      // yjs.undoManager!.clear();
      yjs.addUndoManager();

      const { isWebSocketServerOn } = useStore.getState();
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

      useStore.setState({ isDataLoaded: true, username: yjs.yaccount.get("username") as string });
      log.debug("isDataLoaded", true);

      // const allRootTypes = Object.values(Yjs.ydoc.share);
      // Yjs.undoManager.addToScope(allRootTypes);
    });
  })();

  return startupPromise;
}

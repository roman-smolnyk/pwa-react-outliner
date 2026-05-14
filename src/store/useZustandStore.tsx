import { create } from "zustand";
import localPreferencesManager from "./preferences";

export interface useZustandStoreType {
  isHydrated: boolean;
  isAuthorized: boolean;
  isNewAccount: boolean;
  webSocketServerUrl: string;
  roomToken?: string;
  rootBlockId: string;
  selectedBlockId: string | null;

  focusBlockId: string | null;
  caretCharIndex: number;

  isExplorerOpened: boolean;
  isPageSearchOpened: boolean;
  isChekboxSelectionActive: boolean;

  webSocketConnectionStatus: "connecting" | "connected" | "disconnected" | "turned off";
  viewportWidth: number;

  rerenderPageTicker: number;
  rerenderPage(): void;
}

const useZustandStore = create<useZustandStoreType>((set, get) => ({
  isHydrated: false,
  isAuthorized: false,
  isNewAccount: false,
  webSocketServerUrl: "",
  roomToken: undefined,
  rootBlockId: "",
  selectedBlockId: null,
  focusBlockId: null,
  caretCharIndex: 0,
  isExplorerOpened: true,
  isPageSearchOpened: false,
  isChekboxSelectionActive: false,
  webSocketConnectionStatus: "disconnected",
  viewportWidth: window.innerWidth,

  rerenderPageTicker: 0,
  rerenderPage: () => set((state) => ({ rerenderPageTicker: state.rerenderPageTicker + 1 })),
}));

export async function hydrateZustandStateWithPreferences() {
  const localPref = await localPreferencesManager.get();
  console.debug("Preferences loaded", localPref);
  useZustandStore.setState({
    isHydrated: true,
    isAuthorized: localPref.isAuthorized,
    webSocketServerUrl: localPref.webSocketServerUrl,
    roomToken: localPref.roomToken,
    rootBlockId: localPref.rootBlockId,
  });
}

window.addEventListener("resize", () => {
  useZustandStore.setState({ viewportWidth: window.innerWidth });
});

export default useZustandStore;

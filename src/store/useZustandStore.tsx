import { create } from "zustand";
import localPreferencesManager from "./preferences";

export interface useZustandStoreType {
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

const localPref = await localPreferencesManager.get();

const useZustandStore = create<useZustandStoreType>((set, get) => ({
  isAuthorized: localPref.isAuthorized,
  isNewAccount: false,
  webSocketServerUrl: localPref.webSocketServerUrl,
  roomToken: localPref.roomToken,
  rootBlockId: localPref.rootBlockId,
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

// To listen for changes (rotating a phone/resizing a window)
window.addEventListener("resize", () => {
  useZustandStore.setState({ viewportWidth: window.innerWidth });
});

export default useZustandStore;

import { create } from "zustand";
import localPreferencesManager from "./preferences";

export interface useZustandStoreType {
  authorized: boolean;
  webSocketServerUrl: string;
  newAccount: boolean;
  roomToken?: string;
  yjsLoaded: boolean;
  rootBlockId: string;
  selectedBlockId: string | null;

  focusBlockId: string | null;
  caretCharIndex: number;

  isExplorerOpened: boolean;
  isPageSearchOpened: boolean;
  isChekboxSelectionActive: boolean;

  webSocketConnectionStatus: "connecting" | "connected" | "disconnected" | "turned off";
  viewportWidth: number;
}

const localPref = await localPreferencesManager.get();

const useZustandStore = create<useZustandStoreType>((set, get) => ({
  authorized: localPref.authorized,
  webSocketServerUrl: localPref.webSocketServerUrl,
  newAccount: false,
  roomToken: localPref.roomToken,
  yjsLoaded: false,
  rootBlockId: localPref.rootBlockId,
  selectedBlockId: null,
  focusBlockId: null,
  caretCharIndex: 0,
  isExplorerOpened: true,
  isPageSearchOpened: false,
  isChekboxSelectionActive: false,
  webSocketConnectionStatus: "disconnected",
  viewportWidth: window.innerWidth,
}));

// To listen for changes (rotating a phone/resizing a window)
window.addEventListener("resize", () => {
  useZustandStore.setState({ viewportWidth: window.innerWidth });
});

export default useZustandStore;

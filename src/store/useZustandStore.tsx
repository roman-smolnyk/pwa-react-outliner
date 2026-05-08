import { create } from "zustand";
import localPreferencesManager from "./preferences";

export interface useZustandStoreType {
  authorized: boolean;
  newAccount: boolean;
  roomToken?: string;
  yjsLoaded: boolean;
  rootBlockId: string;

  isExplorerOpened: boolean;
  isPageSearchOpened: boolean;
  isChekboxSelectionActive: boolean;

  webSocketConnectionStatus: "connecting" | "connected" | "disconnected" | "turned off";
}

const localPref = await localPreferencesManager.get();

const useZustandStore = create<useZustandStoreType>((set, get) => ({
  authorized: localPref.authorized,
  newAccount: false,
  roomToken: localPref.roomToken,
  yjsLoaded: false,
  rootBlockId: localPref.rootBlockId,
  isExplorerOpened: false,
  isPageSearchOpened: false,
  isChekboxSelectionActive: false,
  webSocketConnectionStatus: "disconnected",
}));

export default useZustandStore;

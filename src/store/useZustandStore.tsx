import { create } from "zustand";
import localPreferencesManager from "./preferences";

export interface useZustandStoreType {
  authorized: boolean;
  newAccount: boolean;
  roomToken?: string;
  yjsLoaded: boolean;
  rootBlockId: string;
}

const localPref = await localPreferencesManager.get();

const useZustandStore = create<useZustandStoreType>((set, get) => ({
  authorized: localPref.authorized,
  newAccount: false,
  roomToken: localPref.roomToken,
  yjsLoaded: false,
  rootBlockId: localPref.rootBlockId,
}));

export default useZustandStore;

import { create } from "zustand";

export interface useZustandStoreType {
  yjsLoaded: boolean;
}

const useZustandStore = create<useZustandStoreType>((set, get) => ({
  yjsLoaded: false,
}));

export default useZustandStore;

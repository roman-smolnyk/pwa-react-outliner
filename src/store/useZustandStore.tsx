import { create } from "zustand";

export interface useZustandStoreType {
  yjsLoaded: boolean;
  rootId: string;
}

const useZustandStore = create<useZustandStoreType>((set, get) => ({
  yjsLoaded: false,
  rootId: "",
}));

export default useZustandStore;

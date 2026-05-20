import { create } from "zustand";
import localPreferencesManager from "./preferences";

export interface useZustandStoreType {
  isHydrated: boolean;

  isAuthorized: boolean;
  isNewAccount: boolean;
  isDataLoaded: boolean;
  webSocketServerUrl: string;
  roomToken: string;
  rootBlockId: string;

  loadingScreenInfo: string;
  isLoadingScreenShowExit: boolean;

  selectedBlockId: string | null;
  focusBlockId: string | null;
  caretCharIndex: number;

  isExplorerOpened: boolean;
  isGlobalSearchOpened: boolean;
  isPageSearchActive: boolean;
  isChekboxSelectionActive: boolean;

  checkedBlockIds: Set<string>;

  webSocketConnectionStatus: "connecting" | "connected" | "disconnected" | "turned off";
  viewportWidth: number;

  renderPageTicker: number;
  renderPage(): void;

  explorerPanelAction: "collapse" | "expand" | "";
  collapseExplorer(): void;
  expandExplorer(): void;
}

const useZustandStore = create<useZustandStoreType>((set, get) => ({
  isHydrated: false,

  isAuthorized: false,
  isNewAccount: false,
  isDataLoaded: false,
  webSocketServerUrl: "",
  roomToken: "",
  rootBlockId: "",

  loadingScreenInfo: "Loading...",
  isLoadingScreenShowExit: false,

  selectedBlockId: null,
  focusBlockId: null,
  caretCharIndex: 0,

  isExplorerOpened: true,
  isGlobalSearchOpened: false,
  isPageSearchActive: false,
  isChekboxSelectionActive: false,

  checkedBlockIds: new Set(),

  webSocketConnectionStatus: "disconnected",
  viewportWidth: window.innerWidth,

  renderPageTicker: 0,
  renderPage: () => set((state) => ({ renderPageTicker: state.renderPageTicker + 1 })),

  explorerPanelAction: "",
  collapseExplorer: () => set({ explorerPanelAction: "collapse" }),
  expandExplorer: () => set({ explorerPanelAction: "expand" }),
}));

export async function hydrateZustandStateWithPreferences() {
  useZustandStore.setState({
    isHydrated: true,
    isAuthorized: await localPreferencesManager.get("isAuthorized"),
    webSocketServerUrl: await localPreferencesManager.get("webSocketServerUrl"),
    roomToken: await localPreferencesManager.get("roomToken"),
    rootBlockId: await localPreferencesManager.get("rootBlockId"),
  });
}

window.addEventListener("resize", () => {
  useZustandStore.setState({ viewportWidth: window.innerWidth });
});

export default useZustandStore;

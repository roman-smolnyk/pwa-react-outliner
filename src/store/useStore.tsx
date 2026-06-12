import type { EditorView } from "@codemirror/view";
import { create } from "zustand";
import localPreferencesManager from "./preferences";
import type { PanelImperativeHandle } from "react-resizable-panels";
import { isMobile } from "@/utils/utilities";

export interface useStoreType {
  isHydrated: boolean;

  isAuthorized: boolean;
  isNewAccount: boolean;
  isDataLoaded: boolean;
  isWebSocketServerOn: boolean;
  webSocketServerUrl: string;
  roomToken: string;
  rootBlockId: string;

  loadingScreenInfo: string;
  shouldShowLoadingScreenExit: boolean;

  selectedBlockId: string | null;
  focusBlockId: string | null;
  caretCharIndex: number;

  isExplorerOpen: boolean;
  isGlobalSearchOpen: boolean;
  isSettingsOpen: boolean;
  isPageSearchActive: boolean;
  isCheckboxSelectionActive: boolean;
  isMoveToOpen: boolean;
  isCommandsOpen: boolean;

  checkedBlockIds: Set<string>;

  isLockScreenOpen: boolean;
  autoLockTimeout: number;

  webSocketConnectionStatus: "connecting" | "connected" | "disconnected";
  viewportWidth: number;

  editorView: EditorView | null;

  itemIdToMove: string | null;

  renderPageTicker: number;
  renderPage(): void;

  explorerPanel: PanelImperativeHandle | null;
}

const useStore = create<useStoreType>((set, get) => ({
  isHydrated: false,

  isAuthorized: false,
  isNewAccount: false,
  isDataLoaded: false,
  isWebSocketServerOn: true,
  webSocketServerUrl: "",
  roomToken: "",
  rootBlockId: "",

  loadingScreenInfo: "Loading...",
  shouldShowLoadingScreenExit: false,

  selectedBlockId: null,
  focusBlockId: null,
  caretCharIndex: 0,

  isExplorerOpen: true,
  isGlobalSearchOpen: false,
  isSettingsOpen: false,
  isPageSearchActive: false,
  isCheckboxSelectionActive: false,
  isMoveToOpen: false,
  isCommandsOpen: false,

  checkedBlockIds: new Set(),

  isLockScreenOpen: false,
  autoLockTimeout: -1,

  webSocketConnectionStatus: "disconnected",
  viewportWidth: window.innerWidth,

  editorView: null,

  itemIdToMove: null,

  renderPageTicker: 0,
  renderPage: () => set((state) => ({ renderPageTicker: state.renderPageTicker + 1 })),

  explorerPanel: null,
}));

export async function hydrateZustandStateWithPreferences() {
  useStore.setState({
    isHydrated: true,
    isAuthorized: await localPreferencesManager.get("isAuthorized"),
    isWebSocketServerOn: await localPreferencesManager.get("isWebSocketServerOn"),
    webSocketServerUrl: await localPreferencesManager.get("webSocketServerUrl"),
    roomToken: await localPreferencesManager.get("roomToken"),
    rootBlockId: await localPreferencesManager.get("rootBlockId"),
    isLockScreenOpen: !!(await localPreferencesManager.get("lockScreenPin")),
    autoLockTimeout: await localPreferencesManager.get("autoLockScreen"),
  });
}

window.addEventListener("resize", () => {
  useStore.setState({ viewportWidth: window.innerWidth });
});

export default useStore;

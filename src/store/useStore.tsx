import { isMobile } from "@/utils/utilities";
import type { EditorView } from "@codemirror/view";
import type { PanelImperativeHandle } from "react-resizable-panels";
import { create } from "zustand";
import localPreferencesManager from "./preferences";

export interface useStoreType {
  isHydrated: boolean;

  isAuthorized: boolean;
  isSignUp: boolean;
  isNewAccount: boolean;
  isDataLoaded: boolean;
  isWebSocketServerOn: boolean;
  webSocketServerUrl: string;
  roomToken: string;
  rootBlockId: string;
  username: string;

  loadingScreenMessage: string;

  activeBlockId: string | null;
  caretCharIndex: number;

  isExplorerOpen: boolean;
  isGlobalSearchOpen: boolean;
  isSettingsOpen: boolean;
  isPageSearchActive: boolean;
  isCheckboxSelectionActive: boolean;
  isMoveToOpen: boolean;
  isCommandPaletteOpen: boolean;

  checkedBlockIds: Set<string>;

  isLockScreenOpen: boolean;
  autoLockTimeout: number;

  webSocketConnectionStatus: "connecting" | "connected" | "disconnected";
  viewportWidth: number;

  editorView: EditorView | null;

  itemIdToMove: string | null;

  renderPageTicker: number;
  renderPage(): void;

  sidebarPanel: PanelImperativeHandle | null;
  footerElement: HTMLElement | null;
  inputFocusKeeperElement: HTMLElement | null;

  idToPrint: string | null;
}

const useStore = create<useStoreType>((set, get) => ({
  isHydrated: false,

  isAuthorized: false,
  isSignUp: false,
  isNewAccount: false,
  isDataLoaded: false,
  isWebSocketServerOn: true,
  webSocketServerUrl: "",
  roomToken: "",
  rootBlockId: "",
  username: "",

  loadingScreenMessage: "",

  activeBlockId: null,
  caretCharIndex: 0,

  isExplorerOpen: false,
  isGlobalSearchOpen: false,
  isSettingsOpen: false,
  isPageSearchActive: false,
  isCheckboxSelectionActive: false,
  isMoveToOpen: false,
  isCommandPaletteOpen: false,

  checkedBlockIds: new Set(),

  isLockScreenOpen: false,
  autoLockTimeout: -1,

  webSocketConnectionStatus: "disconnected",
  viewportWidth: window.innerWidth,

  editorView: null,

  itemIdToMove: null,

  renderPageTicker: 0,
  renderPage: () => set((state) => ({ renderPageTicker: state.renderPageTicker + 1 })),

  sidebarPanel: null,
  footerElement: null,
  inputFocusKeeperElement: null,

  idToPrint: null,
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
    autoLockTimeout: await localPreferencesManager.get("autoLockTimeout"),
    isExplorerOpen: !isMobile(),
  });
}

window.addEventListener("resize", () => {
  useStore.setState({ viewportWidth: window.innerWidth });
});

export default useStore;

import { LoaderIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { Group, Panel, Separator, useDefaultLayout, type PanelImperativeHandle } from "react-resizable-panels";
import { ToastContainer } from "react-toastify";
import { MOBILE_WIDTH } from "../../../config";
import { ContentViewModeContextProvider } from "../../contexts/PlainTextViewContext";
import { ReadOnlyContextProvider } from "../../contexts/ReadOnlyContext";
import onStartUp from "../../onStartUp";
import useZustandStore from "../../store/useZustandStore";
import yjs from "../../store/yjsManager";
import ExplorerContainer from "../Explorer/ExplorerContainer";
import Footer from "../Footer/Footer";
import Header from "../Header/Header";
import PageContainer from "../Page/PageContainer";
import { logout } from "../../api/api";

function Spinner() {
  console.debug("Spinner");

  const loadingScreenInfo = useZustandStore((s) => s.loadingScreenInfo);
  const isLoadingScreenShowExit = useZustandStore((s) => s.isLoadingScreenShowExit);

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center gap-5">
      <LoaderIcon className="animate-spin [animation-duration:2s]" size={50} />
      <div className="px-10">{loadingScreenInfo}</div>
      {isLoadingScreenShowExit && (
        <button
          className="min-w-30 bg-gray-900 text-white p-2 rounded cursor-pointer
                      hover:scale-105 active:scale-100 transition-transform"
          type="button"
          onClick={() => {
            if (confirm("All data on this device will be wiped. Are you sure?")) {
              logout();
            }
          }}
        >
          Exit
        </button>
      )}
    </div>
  );
}

function useSetupHotkeys() {
  useHotkeys(
    "ctrl+z, meta+z",
    () => {
      console.warn("ctrl+z, meta+z");
      yjs.undoManager?.undo();
    },
    // { enableOnContentEditable: true },
  );
  useHotkeys(
    "ctrl+shift+z, meta+shift+z",
    () => {
      console.warn("ctrl+shift+z, meta+shift+z");
      yjs.undoManager?.redo();
    },
    // { enableOnContentEditable: true },
  );
  // useHotkeys(
  //   "ctrl+f",
  //   (e) => {
  //     console.warn("ctrl+f");
  //     e.preventDefault();
  //     e.stopPropagation();
  //     TreeRoAPI.useStore.setState((state) => {
  //       return { documentSearchIsOpened: !state.documentSearchIsOpened };
  //     });
  //   },
  //   {
  //     enableOnFormTags: true, // This allows the hotkey to work while inside your search input
  //   },
  // );
  // useHotkeys(
  //   "ctrl+shift+f",
  //   (e) => {
  //     console.warn("ctrl+f");
  //     e.preventDefault();
  //     e.stopPropagation();
  //     TreeRoAPI.useStore.setState((state) => {
  //       return { globalSearchIsOpened: !state.globalSearchIsOpened };
  //     });
  //   },
  //   {
  //     enableOnFormTags: true, // This allows the hotkey to work while inside your search input
  //   },
  // );
}

export default function Main() {
  console.debug("Main");
  const explorerPanelRef = useRef<PanelImperativeHandle>(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const viewportWidth = useZustandStore((s) => s.viewportWidth);

  const { defaultLayout, onLayoutChanged } = useDefaultLayout({
    id: "panelsLayout",
    panelIds: ["ExplorerPanel", "PagePanel"],
    storage: localStorage,
  });

  useEffect(() => {
    onStartUp(async () => {
      console.debug("setIsDataLoaded", true);
      setIsDataLoaded(true);
    });
  }, []);

  useSetupHotkeys();

  if (!isDataLoaded) {
    return <Spinner />;
  }

  return (
    <div className="Main">
      <ReadOnlyContextProvider>
        <ContentViewModeContextProvider>
          <Header />

          <Group defaultLayout={defaultLayout} onLayoutChanged={onLayoutChanged}>
            <Panel
              id="ExplorerPanel"
              panelRef={explorerPanelRef}
              defaultSize={"30%"}
              minSize={viewportWidth > MOBILE_WIDTH ? 150 : "90%"}
              maxSize={viewportWidth > MOBILE_WIDTH ? "30%" : "90%"}
              collapsible
              collapsedSize={0}
              onResize={(size) => {
                if (size.inPixels > 0) {
                  useZustandStore.setState({ isExplorerOpened: true });
                } else {
                  useZustandStore.setState({ isExplorerOpened: false });
                }

                document.documentElement.style.setProperty("--explorer-width", `${size.inPixels}px`);
              }}
            >
              <div className="h-dvh overflow-hidden flex flex-col">
                <ExplorerContainer explorerPanelRef={explorerPanelRef} />
              </div>
            </Panel>
            <Separator
              className="w-0.5 bg-gray-200 z-20
                                  shadow-[2px_0px_5px_rgba(0,0,0,0.15)]
                                  "
            />
            <Panel id="PagePanel">
              <div className="h-dvh overflow-hidden flex flex-col">
                <div className="Spacer min-h-12 sm:min-h-8"></div>
                <PageContainer />
                <div className="Spacer min-h-12 sm:min-h-8"></div>
              </div>
            </Panel>
          </Group>

          <Footer />
        </ContentViewModeContextProvider>
      </ReadOnlyContextProvider>
      <ToastContainer
        containerId="toaster"
        position="top-right"
        autoClose={3_000}
        hideProgressBar={true}
        closeButton={false}
        closeOnClick={true}
        draggable={true}
        limit={3}
        style={{ top: 50 }}
        // toastClassName={"min-h-0! h-10! w-60! rounded-xl! top-5! sm:top-0! right-5! sm:right-0!"}
      />
    </div>
  );
}

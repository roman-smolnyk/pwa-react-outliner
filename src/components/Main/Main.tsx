import log from "loglevel";
import { useEffect, useRef } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { Group, Panel, Separator, useDefaultLayout, type PanelImperativeHandle } from "react-resizable-panels";
import { MOBILE_WIDTH } from "../../../config";
import { toggleGlobalSearch, togglePageSearch } from "../../api/api";
import onStartUp from "../../onStartUp";
import useStore from "../../store/useStore";
import yjs from "../../store/yjsManager";
import Commands from "../Commands/Commands";
import ExplorerContainer from "../Explorer/ExplorerContainer";
import Footer from "../Footer/Footer";
import Header from "../Header/Header";
import { MoveTo } from "../MoveTo/MoveTo";
import PageContainer from "../Page/PageContainer";
import Settings from "../Settings/Settings";
import LoadingScreen from "./LoadingScreen";

function useSetupHotkeys() {
  useHotkeys(
    "ctrl+z, meta+z",
    () => {
      log.warn("ctrl+z, meta+z");
      yjs.undoManager?.undo();
    },
    // { enableOnContentEditable: true },
  );
  useHotkeys(
    "ctrl+shift+z, meta+shift+z",
    () => {
      log.warn("ctrl+shift+z, meta+shift+z");
      yjs.undoManager?.redo();
    },
    // { enableOnContentEditable: true },
  );
  useHotkeys(
    "ctrl+f, meta+f",
    (e) => {
      log.warn("ctrl+f");
      e.preventDefault();
      e.stopPropagation();
      togglePageSearch();
    },
    {
      enableOnFormTags: true, // This allows the hotkey to work while inside your search input
    },
  );
  useHotkeys(
    "ctrl+shift+f, meta+shift+f",
    (e) => {
      log.warn("ctrl+shift+f");
      e.preventDefault();
      e.stopPropagation();
      toggleGlobalSearch();
    },
    {
      enableOnFormTags: true, // This allows the hotkey to work while inside your search input
    },
  );
}

export default function Main() {
  log.debug("Main");
  const explorerPanelRef = useRef<PanelImperativeHandle>(null);
  const isDataLoaded = useStore((s) => s.isDataLoaded);
  const viewportWidth = useStore((s) => s.viewportWidth);

  const { defaultLayout, onLayoutChanged } = useDefaultLayout({
    id: "panelsLayout",
    panelIds: ["ExplorerPanel", "PagePanel"],
    storage: localStorage,
  });

  useEffect(() => {
    onStartUp();
  }, []);

  useSetupHotkeys();

  log.debug("isDataLoaded", isDataLoaded);

  if (!isDataLoaded) {
    return <LoadingScreen />;
  }

  return (
    <div className="Main">
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
              useStore.setState({ isExplorerOpen: true });
            } else {
              useStore.setState({ isExplorerOpen: false });
            }

            document.documentElement.style.setProperty("--explorer-width", `${size.inPixels}px`);
          }}
        >
          <div className="h-dvh overflow-hidden flex flex-col">
            <ExplorerContainer explorerPanelRef={explorerPanelRef} />
          </div>
        </Panel>
        <Separator
          className="relative max-sm:hidden w-2 group cursor-col-resize z-20
                    bg-sidebar
                    flex justify-center items-center select-none"
          style={
            {
              // boxShadow: "1px 0px 5px 0px light-dark(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.8))",
              // clipPath: "inset(0px -20px 0px 0px)",
            }
          }
        >
          <div className="w-1 h-full bg-border group-hover:bg-ring group-hover:w-1 transition-all duration-150 ease-in-out" />
        </Separator>
        <Panel id="PagePanel">
          <div className="h-dvh overflow-hidden flex flex-col">
            <div className="Spacer min-h-10"></div>
            <PageContainer />
            <div className="Spacer min-h-12"></div>
          </div>
        </Panel>
      </Group>

      <Settings />
      <MoveTo />
      <Commands />

      <Footer />
    </div>
  );
}

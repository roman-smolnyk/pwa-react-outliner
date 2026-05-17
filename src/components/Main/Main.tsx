import { useEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { Group, Panel, Separator, useDefaultLayout, type PanelImperativeHandle } from "react-resizable-panels";
import { MOBILE_WIDTH } from "../../../config";
import onStartUp from "../../onStartUp";
import useZustandStore from "../../store/useZustandStore";
import yjs from "../../store/yjsManager";
import ExplorerContainer from "../Explorer/ExplorerContainer";
import Footer from "../Footer/Footer";
import Header from "../Header/Header";
import PageContainer from "../Page/PageContainer";
import Spinner from "./Spinner";

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
          // shadow-[2px_0px_5px_rgba(0,0,0,0.15)]
          // shadow-[1.5px_0px_5px_var(--color-theme-fg)]
          className="w-0.5 bg-theme-bg-selected z-20"
          style={{
            // boxShadow: "10px 0px 10px -4px rgba(0, 0, 0, 0.3)"
            boxShadow: "1px 0px 4px rgba(0, 0, 0, 0.8)",
            clipPath: "inset(0px -20px 0px 0px)",
          }}
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
    </div>
  );
}

import { ToastContainer } from "react-toastify";
import PWABadge from "../PWA/PWABadge";
import { ReadOnlyContextProvider } from "../../contexts/ReadOnlyContext";
import { PlainTextViewContextProvider } from "../../contexts/PlainTextViewContext";
import { useEffect, useRef, useState } from "react";
import onStartUp from "../../onStartUp";
import yjs from "../../store/yjsManager";
import PageContainer from "../Page/PageContainer";
import useZustandStore from "../../store/useZustandStore";
import { openBlock } from "../../api/api";
import localPreferencesManager from "../../store/preferences";
import Header from "../Header/Header";
import { LoaderIcon, RefreshCwIcon } from "lucide-react";
import Footer from "../Footer/Footer";

import { Group, Panel, Separator, useDefaultLayout } from "react-resizable-panels";
import Explorer from "../Explorer/Explorer";

function Spinner() {
  return (
    <div className="h-screen w-screen flex items-center justify-center">
      <LoaderIcon className="animate-spin [animation-duration:2s]" size={50} />
    </div>
  );
}

export default function Main() {
  const [loaded, setLoaded] = useState(false);
  const [blockId, setBlockId] = useState("");
  const explorerPanelRef = useRef(null);

  const { defaultLayout, onLayoutChanged } = useDefaultLayout({
    id: "panelsLayout",
    // This set of ids must match the Panels rendered during mount,
    // or the default layout will not be restored
    panelIds: ["ExplorerPanel", "PagePanel"],
    storage: localStorage,
  });

  useEffect(() => {
    onStartUp(async () => {
      console.debug("MainComp:setLoaded", true);
      setLoaded(true);
      const localPref = await localPreferencesManager.get();
      console.debug(localPref.rootBlockId);
      setBlockId(localPref.rootBlockId);
    });
  }, []);

  if (loaded && blockId) {
    const yblock = yjs.yblocks.get(blockId);
    if (yblock) {
      openBlock(yblock.get("id"));
    }
  } else {
    console.debug("MAIN", loaded, blockId);
    return <Spinner />;
  }

  return (
    <div className="Main">
      <ReadOnlyContextProvider>
        <PlainTextViewContextProvider>
          <Header />
          {/* <button
            className="relative z-100"
            type="button"
            onClick={() => {
              console.debug(explorerPanelRef.current, explorerPanelRef.current?.isCollapsed());
              if (explorerPanelRef.current?.isCollapsed()) {
                explorerPanelRef.current?.expand();
              } else {
                explorerPanelRef.current?.collapse();
              }
            }}
          >
            Zebra
          </button> */}

          <Group defaultLayout={defaultLayout} onLayoutChanged={onLayoutChanged}>
            <Panel
              id="ExplorerPanel"
              panelRef={explorerPanelRef}
              defaultSize={"25%"}
              minSize={150}
              maxSize={350}
              collapsible
              collapsedSize={0}
              onResize={(size) => {
                document.documentElement.style.setProperty("--explorer-width", `${size.inPixels}px`);
                console.debug("ZZZZZ", explorerPanelRef.current?.isCollapsed());
              }}
            >
              <Explorer rootId={yjs.yaccount.get("root_id")!}/>
            </Panel>
            <Separator className="w-1 bg-gray-300" />
            <Panel id="PagePanel">
              <div
                className="PageWin-container h-dvh overflow-hidden
                     text-lg sm:text-base flex flex-col"
              >
                <div className="border min-h-10 sm:min-h-8"></div>

                <PageContainer />
                <div className="border min-h-10 sm:min-h-8"></div>
              </div>
            </Panel>
          </Group>

          <Footer />
        </PlainTextViewContextProvider>
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
      />
    </div>
  );
}

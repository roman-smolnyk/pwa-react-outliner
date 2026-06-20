import { Sheet, SheetContent } from "@/components/ui/sheet";
import useIsMobile from "@/hooks/useIsMobile";
import useSetupHotkeys from "@/hooks/useSetupHotkeys";
import log from "loglevel";
import { useEffect } from "react";
import { Group, Panel, Separator, useDefaultLayout } from "react-resizable-panels";
import { handleExplorerClose } from "../../api/api";
import onStartUp from "../../onStartUp";
import useStore from "../../store/useStore";
import CommandPalette from "../CommandPalette/CommandPalette";
import ExplorerContainer from "../Explorer/ExplorerContainer";
import Footer from "../Footer/Footer";
import Header from "../Header/Header";
import { MoveTo } from "../MoveTo/MoveTo";
import PageContainer from "../Page/PageContainer";
import Printer from "../Page/Printer";
import Settings from "../Settings/Settings";
import LoadingScreen from "./LoadingScreen";

function FocusKeeper() {
  // Prevents on screen keyboard flickering between actions
  return <input ref={(el) => useStore.setState({ inputFocusKeeperElement: el })} type="text" className="sr-only" tabIndex={-1} aria-hidden="true" />;
}

export default function Main() {
  log.debug("Main");

  const isDataLoaded = useStore((s) => s.isDataLoaded);
  const isExplorerOpen = useStore((s) => s.isExplorerOpen);

  const isMobile = useIsMobile();

  const { defaultLayout, onLayoutChanged } = useDefaultLayout({
    id: "panelsLayout",
    panelIds: ["SidebarPanel", "MainPanel"],
    storage: localStorage,
  });

  useEffect(() => {
    onStartUp();
  }, []);

  useEffect(() => {
    if (isMobile) {
      document.documentElement.style.setProperty("--explorer-width", `0px`);
    }
  }, [isMobile]);

  useSetupHotkeys();

  log.debug("isDataLoaded", isDataLoaded);
  if (!isDataLoaded) {
    return <LoadingScreen />;
  }

  return (
    <div className="Main">
      <Header />

      {isMobile ? (
        /* Mobile Layout: Full Page view + Explorer inside Sheet */
        <div className="h-dvh flex flex-col">
          <Sheet open={isExplorerOpen} onOpenChange={handleExplorerClose}>
            <SheetContent side="left" showCloseButton={false} className="data-[side=left]:w-6/7 text-base">
              <ExplorerContainer />
            </SheetContent>
          </Sheet>

          <PageContainer />
        </div>
      ) : (
        <Group defaultLayout={defaultLayout} onLayoutChanged={onLayoutChanged}>
          <Panel
            id="SidebarPanel"
            panelRef={(ref) => useStore.setState({ sidebarPanel: ref })}
            defaultSize={300}
            minSize={isMobile ? "90%" : 200}
            maxSize={isMobile ? "90%" : "40%"}
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
            <ExplorerContainer />
          </Panel>
          <Separator
            className="relative w-2 group cursor-col-resize z-20
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
          <Panel id="MainPanel">
            <PageContainer />
          </Panel>
        </Group>
      )}

      <Settings />
      <MoveTo />
      <CommandPalette />

      <Footer />

      <FocusKeeper />
      <Printer />
    </div>
  );
}

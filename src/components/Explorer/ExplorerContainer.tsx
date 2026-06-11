import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import log from "loglevel";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { PanelImperativeHandle } from "react-resizable-panels";
import useStore from "../../store/useStore";
import yjs from "../../store/yjsManager";
import { isMobile } from "../../utils/utilities";
import Explorer from "./Explorer";
import ExplorerToolsPanel from "./ExplorerToolsPanel";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export default function ExplorerContainer({ explorerPanelRef }: { explorerPanelRef: React.RefObject<PanelImperativeHandle | null> }) {
  log.debug("ExplorerContainer");

  const [explorerLength, setExplorerLength] = useState(Array.from(yjs.yexplorer.keys()).length);

  const isExplorerOpen = useStore((s) => s.isExplorerOpen);

  // Moved explorer panel actions here to prevent Main component rerender
  const explorerAction = useStore((s) => s.explorerPanelAction);
  useEffect(() => {
    if (!explorerPanelRef.current) return;
    if (explorerAction === "expand") {
      explorerPanelRef.current.expand();
      useStore.setState({ isExplorerOpen: true });
      if (isMobile()) {
        useStore.setState({ isPageSearchActive: false });
      }
    } else if (explorerAction === "collapse") {
      explorerPanelRef.current.collapse();
      useStore.setState({ isExplorerOpen: false });
    }
    useStore.setState({ explorerPanelAction: "" });
  }, [explorerAction, explorerPanelRef]);

  useEffect(() => {
    function observer() {
      setExplorerLength(Array.from(yjs.yexplorer.keys()).length);
    }
    yjs.yexplorer.observe(observer);
    return () => {
      yjs.yexplorer.unobserve(observer);
    };
  });

  const rootId = yjs.yaccount.get("root_id")!;

  const EmptyExplorer = () => (
    <Empty>
      <EmptyHeader>
        <EmptyTitle>No Documents</EmptyTitle>
        <EmptyDescription>Create new or sync</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );

  return (
    <>
      <div className="ExplorerContainer flex-1 relative bg-sidebar text-sidebar-foreground z-0 min-h-0 flex flex-col">
        <ExplorerToolsPanel explorerPanelRef={explorerPanelRef} />
        <div
          className="flex-1 pt-5 overflow-y-auto overscroll-contain"
          // style={{
          //   height: `calc(100dvh - 2.5rem)`, // example if header/footer 2.5rem each
          // }}
        >
          {explorerLength <= 1 ? <EmptyExplorer /> : <Explorer rootId={rootId} />}
          <div className="Spacer h-[50dvh]"></div>
        </div>
      </div>
      {isExplorerOpen &&
        isMobile() &&
        createPortal(
          <div
            className="ExplorerShadow fixed top-0 right-0 h-full w-[10dvw] bg-black/40 z-10"
            onClick={() => {
              useStore.setState({ explorerPanelAction: "collapse" });
            }}
          />,
          document.getElementById("root")!,
        )}
    </>
  );
}

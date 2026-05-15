import { useEffect } from "react";
import { createPortal } from "react-dom";
import type { PanelImperativeHandle } from "react-resizable-panels";
import useZustandStore from "../../store/useZustandStore";
import yjs from "../../store/yjsManager";
import Explorer from "./Explorer";
import ExplorerToolsPanel from "./ExplorerToolsPanel";

export default function ExplorerContainer({ explorerPanelRef }: { explorerPanelRef: React.RefObject<PanelImperativeHandle | null> }) {
  console.debug("ExplorerContainer");

  const isExplorerOpened = useZustandStore((s) => s.isExplorerOpened);

  // Moved explorer panel actions here to prevent Main component rerender
  const explorerAction = useZustandStore((s) => s.explorerPanelAction);
  useEffect(() => {
    if (!explorerPanelRef.current) return;
    if (explorerAction === "expand") {
      explorerPanelRef.current.expand();
      useZustandStore.setState({ isExplorerOpened: true });
    } else if (explorerAction === "collapse") {
      explorerPanelRef.current.collapse();
      useZustandStore.setState({ isExplorerOpened: false });
    }
    useZustandStore.setState({ explorerPanelAction: "" });
  }, [explorerAction, explorerPanelRef]);

  const rootId = yjs.yaccount.get("root_id")!;

  return (
    <>
      <div className="ExplorerContainer flex-1 relative z-0 min-h-0 flex flex-col">
        <ExplorerToolsPanel explorerPanelRef={explorerPanelRef} />
        <div
          className="flex-1 overflow-y-auto overscroll-y-contain
                    px-5 sm:pl-2 sm:pr-3 pt-5
                    "
          // style={{
          //   height: `calc(100dvh - 2.5rem)`, // example if header/footer 2.5rem each
          // }}
        >
          <Explorer rootId={rootId} />
          <div className="Spacer h-[50dvh]"></div>
        </div>
      </div>
      {isExplorerOpened &&
        createPortal(
          <div className="ExplorerShadow fixed top-0 right-0 h-full w-[10dvw] bg-black opacity-60 z-10" />,
          document.getElementById("root")!,
        )}
    </>
  );
}

import yjs from "../../store/yjsManager";
import Explorer from "./Explorer";
import ExplorerToolsPanel from "./ExplorerToolsPanel";
import type { PanelImperativeHandle } from "react-resizable-panels";

export default function ExplorerContainer({ explorerPanelRef }: { explorerPanelRef: React.RefObject<PanelImperativeHandle | null> }) {
  console.debug("ExplorerContainer");

  const rootId = yjs.yaccount.get("root_id")!;

  return (
    <div className="ExplorerContainer flex-1 relative z-0 min-h-0 flex flex-col">
      <ExplorerToolsPanel explorerPanelRef={explorerPanelRef} />
      <div
        className="flex-1 overflow-y-auto overscroll-y-contain
                    px-5 sm:pl-2 sm:pr-3 pt-5 pb-100
                    "
        // style={{
        //   height: `calc(100dvh - 2.5rem)`, // example if header/footer 2.5rem each
        // }}
      >
        <Explorer rootId={rootId} />
      </div>
    </div>
  );
}

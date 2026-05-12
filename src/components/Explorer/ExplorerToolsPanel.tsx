import { createInsertCollection, createInsertPage } from "esm-treero-api";
import { FilePlusIcon, FolderPlusIcon, PanelLeftCloseIcon, SearchIcon } from "lucide-react";
import type { PanelImperativeHandle } from "react-resizable-panels";
import useZustandStore from "../../store/useZustandStore";
import yjs from "../../store/yjsManager";
import Button from "../Common/Button";

export default function ExplorerToolsPanel({ explorerPanelRef }: { explorerPanelRef: React.RefObject<PanelImperativeHandle | null> }) {
  const isExplorerOpened = useZustandStore((s) => s.isExplorerOpened);
  const rootCollectionId = yjs.yaccount.get("root_id");
  const rootBlockId = useZustandStore((s) => s.rootBlockId);

  if (!rootCollectionId) {
    throw new Error(`rootCollectionId is missing`);
  }

  return (
    <div
      className="ToolsPanel min-w-0 min-h-10 sm:min-h-8 px-2 bg-white shadow-[0_1px_5px_rgba(0,0,0,0.15)] flex"
      style={{ width: `${isExplorerOpened ? "var(--sidebar-width)" : "0px"}` }}
    >
      {/* {globalSearchIsOpened && <GlobalSearchPortalComponent />} */}

      <div className="flex-1 flex items-center">
        {/* Left icons */}
        <div className="mr-3 flex items-center gap-3 sm:gap-2">
          <Button onClick={() => explorerPanelRef.current?.collapse()}>
            <PanelLeftCloseIcon />
          </Button>
        </div>

        <div className="Spacer flex-1"></div>

        {/* Right icons */}
        <div className="flex items-center gap-3 sm:gap-2">
          <Button
            onClick={() => {
              createInsertPage(yjs.ydoc, "Untitled", rootCollectionId, 0);
            }}
          >
            <FilePlusIcon />
          </Button>

          <Button
            onClick={() => {
              createInsertCollection(yjs.ydoc, "Untitled", rootCollectionId, 0);
            }}
          >
            <FolderPlusIcon />
          </Button>

          <Button>
            <SearchIcon />
          </Button>
        </div>
      </div>
    </div>
  );
}

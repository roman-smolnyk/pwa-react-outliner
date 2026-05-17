import { createInsertCollection, createInsertPage } from "esm-treero-api";
import { FilePlusIcon, FolderPlusIcon, PanelLeftCloseIcon, SearchIcon } from "lucide-react";
import type { PanelImperativeHandle } from "react-resizable-panels";
import useZustandStore from "../../store/useZustandStore";
import yjs from "../../store/yjsManager";
import Button from "../Common/Button";
import { handleCollectionAdd, handlePageAdd } from "../../api/api";
import GlobalSearch from "../GlobalSearch/GlobalSearch";
import { createPortal } from "react-dom";

export default function ExplorerToolsPanel({ explorerPanelRef }: { explorerPanelRef: React.RefObject<PanelImperativeHandle | null> }) {
  const isExplorerOpened = useZustandStore((s) => s.isExplorerOpened);
  const isGlobalSearchOpened = useZustandStore((s) => s.isGlobalSearchOpened);

  const rootCollectionId = yjs.yaccount.get("root_id");
  if (!rootCollectionId) {
    throw new Error(`rootCollectionId is missing`);
  }

  return (
    <div
      className="ToolsPanel min-w-0 min-h-12 sm:min-h-8 px-4 sm:px-2 bg-theme-bg shadow-[0_1px_5px_rgba(0,0,0,0.15)] flex"
      style={{ width: `${isExplorerOpened ? "var(--sidebar-width)" : "0px"}` }}
    >
      {/* {globalSearchIsOpened && <GlobalSearchPortalComponent />} */}

      <div className="flex-1 flex items-center">
        {/* Left icons */}
        <div className="mr-3 flex items-center gap-3 sm:gap-2">
          <Button
            onClick={() => {
              useZustandStore.getState().collapseExplorer();
              // explorerPanelRef.current?.collapse();
            }}
          >
            <PanelLeftCloseIcon />
          </Button>
        </div>

        <div className="Spacer flex-1"></div>

        {/* Right icons */}
        <div className="flex items-center gap-3 sm:gap-2">
          <Button
            title="Add File"
            onClick={() => {
              // createInsertPage(yjs.ydoc, "Untitled", rootCollectionId, 0);
              handlePageAdd(rootCollectionId);
            }}
          >
            <FilePlusIcon />
          </Button>

          <Button
            title="Add Folder"
            onClick={() => {
              handleCollectionAdd(rootCollectionId);
            }}
          >
            <FolderPlusIcon />
          </Button>

          <Button
            title="Global Search"
            onClick={() => {
              useZustandStore.setState({ isGlobalSearchOpened: true });
            }}
          >
            <SearchIcon />
          </Button>
        </div>
      </div>
      {isGlobalSearchOpened && createPortal(<GlobalSearch />, document.getElementById("root")!)}
    </div>
  );
}

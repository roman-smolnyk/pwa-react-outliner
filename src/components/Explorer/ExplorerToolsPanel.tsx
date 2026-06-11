import { Button } from "@/components/ui/button";
import { getRootCollectionId } from "esm-treero-api";
import { CopyMinusIcon, CopyPlusIcon, FilePlusIcon, FolderPlusIcon, PanelLeftCloseIcon, SearchIcon } from "lucide-react";
import { createPortal } from "react-dom";
import type { PanelImperativeHandle } from "react-resizable-panels";
import { handleCollectionAdd, handlePageAdd, toggleGlobalSearch } from "../../api/api";
import useStore from "../../store/useStore";
import yjs from "../../store/yjsManager";
import GlobalSearch from "../GlobalSearch/GlobalSearch";

export default function ExplorerToolsPanel({ explorerPanelRef }: { explorerPanelRef: React.RefObject<PanelImperativeHandle | null> }) {
  const isExplorerOpen = useStore((s) => s.isExplorerOpen);
  const isGlobalSearchOpen = useStore((s) => s.isGlobalSearchOpen);

  const isAllCollapsed = true;

  return (
    <div
      className="ToolsPanel min-w-0 min-h-10 px-4
                bg-sidebar text-sidebar-foreground border-b border-border
                flex"
      style={{
        width: `${isExplorerOpen ? "var(--sidebar-width)" : "0px"}`,
        // boxShadow: "0px 1px 5px 0px light-dark(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.8))",
        // clipPath: "inset(0px 0px -20px 0px)",
      }}
    >

      <div className="flex-1 flex items-center">
        {/* Left icons */}
        <div className="mr-2 flex items-center gap-2">
          <Button
            variant="bare"
            size="tool"
            onClick={() => {
              useStore.getState().collapseExplorer();
              // explorerPanelRef.current?.collapse();
            }}
          >
            <PanelLeftCloseIcon />
          </Button>
        </div>

        <div className="Spacer flex-1"></div>

        {/* Right icons */}
        <div className="flex items-center gap-0">
          <Button
            variant="bare"
            size="tool"
            title="Add File"
            onClick={() => {
              handlePageAdd(getRootCollectionId(yjs.yaccount));
            }}
          >
            <FilePlusIcon />
          </Button>

          <Button
            variant="bare"
            size="tool"
            title="Add Folder"
            onClick={() => {
              handleCollectionAdd(getRootCollectionId(yjs.yaccount));
            }}
          >
            <FolderPlusIcon />
          </Button>

          <Button
            variant="bare"
            size="tool"
            title="Global Search"
            onClick={() => {
              toggleGlobalSearch();
            }}
          >
            <SearchIcon />
          </Button>
        </div>
      </div>
      {isGlobalSearchOpen && createPortal(<GlobalSearch />, document.getElementById("root")!)}
    </div>
  );
}

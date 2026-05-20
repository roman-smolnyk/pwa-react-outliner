import { getRootCollectionId } from "esm-treero-api";
import { FilePlusIcon, FolderPlusIcon, PanelLeftCloseIcon, SearchIcon } from "lucide-react";
import { createPortal } from "react-dom";
import type { PanelImperativeHandle } from "react-resizable-panels";
import { handleCollectionAdd, handlePageAdd } from "../../api/api";
import useZustandStore from "../../store/useZustandStore";
import yjs from "../../store/yjsManager";
import Button from "../Common/Button";
import LucideIcon from "../Common/LucideIcon";
import GlobalSearch from "../GlobalSearch/GlobalSearch";

export default function ExplorerToolsPanel({ explorerPanelRef }: { explorerPanelRef: React.RefObject<PanelImperativeHandle | null> }) {
  const isExplorerOpened = useZustandStore((s) => s.isExplorerOpened);
  const isGlobalSearchOpened = useZustandStore((s) => s.isGlobalSearchOpened);

  return (
    <div
      className="ToolsPanel min-w-0 min-h-12 sm:min-h-8 px-4 sm:px-2
                bg-sidebar text-sidebar-foreground border-b border-border
                flex"
      style={{
        width: `${isExplorerOpened ? "var(--sidebar-width)" : "0px"}`,
        // boxShadow: "0px 1px 5px 0px light-dark(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.8))",
        // clipPath: "inset(0px 0px -20px 0px)",
      }}
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
            <LucideIcon icon={<PanelLeftCloseIcon />} />
          </Button>
        </div>

        <div className="Spacer flex-1"></div>

        {/* Right icons */}
        <div className="flex items-center gap-3 sm:gap-2">
          <Button
            title="Add File"
            onClick={() => {
              handlePageAdd(getRootCollectionId(yjs.yaccount));
            }}
          >
            <LucideIcon icon={<FilePlusIcon />} />
          </Button>

          <Button
            title="Add Folder"
            onClick={() => {
              handleCollectionAdd(getRootCollectionId(yjs.yaccount));
            }}
          >
            <LucideIcon icon={<FolderPlusIcon />} />
          </Button>

          <Button
            title="Global Search"
            onClick={() => {
              useZustandStore.setState({ isGlobalSearchOpened: true });
            }}
          >
            <LucideIcon icon={<SearchIcon />} />
          </Button>
        </div>
      </div>
      {isGlobalSearchOpened && createPortal(<GlobalSearch />, document.getElementById("root")!)}
    </div>
  );
}

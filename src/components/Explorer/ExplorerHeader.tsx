import { getRootCollectionId } from "esm-treero-api";
import { FilePlusIcon, FolderPlusIcon, PanelLeftCloseIcon, SearchIcon } from "lucide-react";
import { createPortal } from "react-dom";
import { handleCollectionAdd, handleExplorerClose, handlePageAdd, toggleGlobalSearch } from "../../api/api";
import useStore from "../../store/useStore";
import yjs from "../../store/yjsManager";
import ToolButton from "../Common/ToolButton";
import GlobalSearch from "../GlobalSearch/GlobalSearch";

export default function ExplorerHeader() {
  const isExplorerOpen = useStore((s) => s.isExplorerOpen);
  const isGlobalSearchOpen = useStore((s) => s.isGlobalSearchOpen);

  return (
    <div
      className="ExplorerHeader min-w-0 min-h-10 px-2
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
          <ToolButton
            tooltip="Close Sidebar"
            icon={<PanelLeftCloseIcon />}
            hotkey={["⌘", "B"]}
            onClick={() => {
              handleExplorerClose();
            }}
          />
        </div>

        <div className="Spacer flex-1"></div>

        {/* Right icons */}
        <div className="flex items-center gap-0">
          <ToolButton
            tooltip="Add File"
            icon={<FilePlusIcon />}
            onClick={() => {
              handlePageAdd(getRootCollectionId(yjs.yaccount));
            }}
          />

          <ToolButton
            tooltip="Add Folder"
            icon={<FolderPlusIcon />}
            onClick={() => {
              handleCollectionAdd(getRootCollectionId(yjs.yaccount));
            }}
          />

          <ToolButton
            tooltip="Global Search"
            icon={<SearchIcon />}
            hotkey={["⌘", "Shift", "F"]}
            onClick={() => {
              toggleGlobalSearch();
            }}
          />
        </div>
      </div>
      {isGlobalSearchOpen && createPortal(<GlobalSearch />, document.getElementById("root")!)}
    </div>
  );
}

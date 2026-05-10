import { getPageByRootBlockId } from "esm-treero-api";
import useZustandStore from "../../store/useZustandStore";
import yjs from "../../store/yjsManager";
import { FilePlusIcon, FolderPlusIcon, PanelLeftCloseIcon, SearchIcon } from "lucide-react";
import Button from "../Common/Button";
import { type PanelImperativeHandle } from "react-resizable-panels";

export default function ExplorerToolsPanel({ explorerPanelRef }: { explorerPanelRef: React.RefObject<PanelImperativeHandle | null> }) {
  const isExplorerOpened = useZustandStore((state) => state.isExplorerOpened);
  const rootBlockId = useZustandStore((state) => state.rootBlockId);
  // const ypage = getPageByRootBlockId(yjs.ydoc, rootBlockId);
  // const globalSearchIsOpened = useStore((state) => state.globalSearchIsOpened);

  // const rootGroupId = useStore((state) => state.meta.root_group_id);

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
          <Button>
            <FilePlusIcon />
          </Button>

          <Button>
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

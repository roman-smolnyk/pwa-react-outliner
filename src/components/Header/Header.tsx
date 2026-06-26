import log from "loglevel";
import { MenuIcon, PanelLeftIcon, SearchIcon } from "lucide-react";
import { handleExplorerOpen, togglePageSearch } from "../../api/api";
import useStore from "../../store/useStore";
import ToolButton from "../Common/ToolButton";
import PageMenu from "../Page/PageMenu";

export default function Header() {
  log.debug("Header");
  const isExplorerOpen = useStore((s) => s.isExplorerOpen);

  return (
    <div
      data-component="Header"
      className="fixed top-0 right-0 min-w-0 min-h-10 z-10
      text-sidebar-foreground bg-transparent
      pointer-events-none flex"
      style={{
        left: "var(--explorer-width)",
        // boxShadow: "0px 1px 5px 0px light-dark(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.8))",
        // clipPath: "inset(0px 0px -20px 0px)",
      }}
    >
      {/* <div className="px-2 py-3 sm:py-1"> */}
      {/* Left icons */}

      <div className="flex-1 flex items-center justify-center min-w-0">
        <div className="rounded-r-lg bg-sidebar pointer-events-auto flex">
          {!isExplorerOpen && (
            <ToolButton
              tooltip="Open Sidebar"
              icon={<PanelLeftIcon />}
              hotkey={["⌘", "B"]}
              onClick={() => {
                handleExplorerOpen();
              }}
            />
          )}
        </div>

        <div className="flex-1 min-w-0 overflow-x-auto overscroll-contain flex">
          <div className="Spacer flex-1 min-w-4" />

          <div className="RightIcons rounded-l-lg bg-sidebar pointer-events-auto  flex">
            <ToolButton
              tooltip="Search in page"
              icon={<SearchIcon />}
              hotkey={["⌘", "F"]}
              onClick={() => {
                togglePageSearch();
              }}
            />

            <PageMenu />
          </div>
        </div>

        {/* <div className="flex items-center justify-center">
          
        </div> */}
      </div>
      {/* </div> */}
    </div>
  );
}

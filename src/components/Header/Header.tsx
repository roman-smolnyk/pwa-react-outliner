import log from "loglevel";
import { FileCodeIcon, FileImageIcon, FilePlayIcon, ListChecksIcon, ListIcon, MenuIcon, PanelLeftIcon, SearchIcon, TerminalIcon } from "lucide-react";
import { handleExplorerOpen, toggleCheckboxSelection, togglePageSearch } from "../../api/api";
import { useContentViewMode } from "../../contexts/PlainTextViewContext";
import useStore from "../../store/useStore";
import ToolButton from "../Common/ToolButton";
import MainMenu from "../MainMenu/MainMenu";

export default function Header() {
  log.debug("Header");
  const { contentViewMode, setContentViewMode } = useContentViewMode();

  const isExplorerOpen = useStore((s) => s.isExplorerOpen);
  const isChekboxSelectionActive = useStore((s) => s.isCheckboxSelectionActive);

  return (
    <div
      className="Header fixed top-0 right-0 min-w-0 min-h-10 px-2 z-10
      bg-sidebar text-sidebar-foreground 
      flex"
      style={{
        left: "var(--explorer-width)",
        // boxShadow: "0px 1px 5px 0px light-dark(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.8))",
        // clipPath: "inset(0px 0px -20px 0px)",
      }}
    >
      {/* <div className="px-2 py-3 sm:py-1"> */}
      {/* Left icons */}

      <div className="flex-1 flex items-center justify-center min-w-0">
        <div className="flex">
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

          <div className="RightIcons flex">
            <ToolButton
              tooltip="Toggle checkboxes selection"
              icon={isChekboxSelectionActive ? <ListIcon /> : <ListChecksIcon />}
              onClick={() => {
                toggleCheckboxSelection();
              }}
            />



            <ToolButton
              tooltip="Search in page"
              icon={<SearchIcon />}
              hotkey={["⌘", "F"]}
              onClick={() => {
                togglePageSearch();
              }}
            />

            <MainMenu trigger={<ToolButton tooltip="Open Main Menu" icon={<MenuIcon />} />} />
          </div>
        </div>

        {/* <div className="flex items-center justify-center">
          
        </div> */}
      </div>
      {/* </div> */}
    </div>
  );
}

import log from "loglevel";
import {
  FileCodeIcon,
  FileImageIcon,
  FilePlayIcon,
  ListChecksIcon,
  ListIcon,
  MenuIcon,
  PanelLeftIcon,
  PencilIcon,
  PencilOffIcon,
  SearchIcon,
  TerminalIcon,
} from "lucide-react";
import { handleExplorerOpen, toggleCheckboxSelection, togglePageSearch } from "../../api/api";
import { useContentViewMode } from "../../contexts/PlainTextViewContext";
import { useReadOnly } from "../../contexts/ReadOnlyContext";
import useStore from "../../store/useStore";
import Tool from "../Common/Tool";
import MainMenu from "../MainMenu/MainMenu";

export default function Header() {
  log.debug("Header");
  const { readOnly, setReadOnly } = useReadOnly();
  const { contentViewMode, setContentViewMode } = useContentViewMode();

  const isExplorerOpen = useStore((s) => s.isExplorerOpen);
  const isChekboxSelectionActive = useStore((s) => s.isCheckboxSelectionActive);

  return (
    <div
      className="Header fixed top-0 right-0 min-w-0 min-h-10 px-2 z-10
      bg-sidebar text-sidebar-foreground border-b border-border
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
            <Tool
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
            <Tool
              tooltip="Toggle checkboxes selection"
              icon={isChekboxSelectionActive ? <ListIcon /> : <ListChecksIcon />}
              onClick={() => {
                toggleCheckboxSelection();
              }}
            />

            {/* {plainTextView ? <BookTypeIcon /> : <BookImageIcon />} */}
            <Tool
              tooltip="Cycle through content view modes: Source, Markdown, Live Preview."
              icon={contentViewMode === "source" ? <FileCodeIcon /> : contentViewMode === "markdown" ? <FileImageIcon /> : <FilePlayIcon />}
              onClick={() => {
                if (contentViewMode === "source") {
                  setContentViewMode("markdown");
                } else if (contentViewMode === "markdown") {
                  setContentViewMode("livePreview");
                } else if (contentViewMode === "livePreview") {
                  setContentViewMode("source");
                }
              }}
            />

            <Tool
              tooltip="Toggle Edit and View modes"
              icon={readOnly ? <PencilOffIcon /> : <PencilIcon />}
              onClick={() => {
                setReadOnly(!readOnly);
              }}
            />

            <Tool
              tooltip="Open Command Palette"
              icon={<TerminalIcon />}
              hotkey={["⌘", "K"]}
              onClick={() => {
                useStore.setState({ isCommandPaletteOpen: true });
              }}
            />

            <Tool
              tooltip="Search in page"
              icon={<SearchIcon />}
              hotkey={["⌘", "F"]}
              onClick={() => {
                togglePageSearch();
              }}
            />

            <MainMenu trigger={<Tool tooltip="Open Main Menu" icon={<MenuIcon />} />} />
          </div>
        </div>

        {/* <div className="flex items-center justify-center">
          
        </div> */}
      </div>
      {/* </div> */}
    </div>
  );
}

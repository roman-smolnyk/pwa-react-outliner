import { Button } from "@/components/ui/button";
import log from "loglevel";
import {
  FileCodeIcon,
  FileImageIcon,
  FilePlayIcon,
  ListChecksIcon,
  ListIcon,
  PanelLeftIcon,
  PencilIcon,
  PencilOffIcon,
  SearchIcon,
  SquareTerminalIcon,
} from "lucide-react";
import { toggleCheckboxSelection, togglePageSearch } from "../../api/api";
import { useContentViewMode } from "../../contexts/PlainTextViewContext";
import { useReadOnly } from "../../contexts/ReadOnlyContext";
import useStore from "../../store/useStore";
import MainMenu from "../MainMenu/MainMenu";

export default function Header() {
  log.debug("Header");
  const { readOnly, setReadOnly } = useReadOnly();
  const { contentViewMode, setContentViewMode } = useContentViewMode();

  const isExplorerOpen = useStore((s) => s.isExplorerOpen);
  const isChekboxSelectionActive = useStore((s) => s.isCheckboxSelectionActive);

  return (
    <div
      className="Header fixed top-0 right-0 min-w-0 min-h-10 px-4 z-10
      bg-sidebar text-sidebar-foreground border-b border-border
      flex"
      style={{
        left: `${isExplorerOpen ? "var(--explorer-width)" : "0px"}`,
        // boxShadow: "0px 1px 5px 0px light-dark(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.8))",
        // clipPath: "inset(0px 0px -20px 0px)",
      }}
    >
      {/* <div className="px-2 py-3 sm:py-1"> */}
      {/* Left icons */}

      <div className="flex-1 flex items-center justify-center min-w-0">
        <div className="flex">
          {!isExplorerOpen && (
            <Button
              variant="bare"
              size="tool"
              title="Open Explorer"
              onClick={() => {
                useStore.getState().expandExplorer();
              }}
            >
              <PanelLeftIcon />
            </Button>
          )}
        </div>

        <div className="flex-1 min-w-0 overflow-x-auto overscroll-contain flex">
          <div className="Spacer flex-1 min-w-4" />

          <div className="RightIcons flex">
            <Button
              variant="bare"
              size="tool"
              title="Toggle checkboxes selection"
              className=""
              onClick={() => {
                toggleCheckboxSelection();
              }}
            >
              {isChekboxSelectionActive ? <ListIcon /> : <ListChecksIcon />}
            </Button>

            <Button
              variant="bare"
              size="tool"
              title="Cycle through content view modes: Source, Markdown, Live Preview."
              onClick={() => {
                if (contentViewMode === "source") {
                  setContentViewMode("markdown");
                } else if (contentViewMode === "markdown") {
                  setContentViewMode("livePreview");
                } else if (contentViewMode === "livePreview") {
                  setContentViewMode("source");
                }
              }}
            >
              {/* {plainTextView ? <BookTypeIcon /> : <BookImageIcon />} */}
              {contentViewMode === "source" ? <FileCodeIcon /> : contentViewMode === "markdown" ? <FileImageIcon /> : <FilePlayIcon />}
            </Button>

            <Button
              variant="bare"
              size="tool"
              title="Toggle Edit and View modes"
              onClick={() => {
                setReadOnly(!readOnly);
              }}
            >
              {readOnly ? <PencilOffIcon /> : <PencilIcon />}
            </Button>

            <Button
              variant="bare"
              size="tool"
              title="Open commands"
              onClick={() => {
                useStore.setState({ isCommandsOpen: true });
              }}
            >
              <SquareTerminalIcon />
            </Button>

            <Button
              variant="bare"
              size="tool"
              title="Search in page"
              onClick={() => {
                togglePageSearch();
              }}
            >
              <SearchIcon />
            </Button>

            <MainMenu />
          </div>
        </div>

        {/* <div className="flex items-center justify-center">
          
        </div> */}
      </div>
      {/* </div> */}
    </div>
  );
}

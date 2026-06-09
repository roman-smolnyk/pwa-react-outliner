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
import useZustandStore from "../../store/useZustandStore";
import IconedButton from "../Common/IconedButton";
import LucideIcon from "../Common/LucideIcon";
import MainMenu from "../MainMenu/MainMenu";

export default function Header() {
  log.debug("Header");
  const { readOnly, setReadOnly } = useReadOnly();
  const { contentViewMode, setContentViewMode } = useContentViewMode();

  const isExplorerOpened = useZustandStore((s) => s.isExplorerOpened);
  const isChekboxSelectionActive = useZustandStore((s) => s.isChekboxSelectionActive);

  return (
    <div
      className="Header fixed top-0 right-0 min-w-0 min-h-12 sm:min-h-8 px-4 sm:px-2 z-10
      bg-sidebar text-sidebar-foreground border-b border-border
      flex"
      style={{
        left: `${isExplorerOpened ? "var(--explorer-width)" : "0px"}`,
        // boxShadow: "0px 1px 5px 0px light-dark(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.8))",
        // clipPath: "inset(0px 0px -20px 0px)",
      }}
    >
      {/* <div className="px-2 py-3 sm:py-1"> */}
      {/* Left icons */}

      <div className="flex-1 flex min-w-0">
        <div className="mr-4 flex">
          {!isExplorerOpened && (
            <IconedButton
              title="Open Explorer"
              onClick={() => {
                useZustandStore.getState().expandExplorer();
              }}
            >
              <LucideIcon icon={<PanelLeftIcon />} />
            </IconedButton>
          )}
        </div>

        <div className="flex-1 min-w-0 overflow-x-auto flex">
          <div className="LeftIcons min-w-max flex gap-4 sm:gap-2">{/* <div className="Spacer"></div> */}</div>

          <div className="Spacer flex-1 min-w-4" />

          <div className="RightIcons flex items-center justify-center gap-4 sm:gap-2">
            <IconedButton
              title="Toggle checkboxes selection"
              className=""
              onClick={() => {
                toggleCheckboxSelection();
              }}
            >
              <LucideIcon icon={isChekboxSelectionActive ? <ListIcon /> : <ListChecksIcon />} />
            </IconedButton>

            <IconedButton
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
              <LucideIcon
                icon={contentViewMode === "source" ? <FileCodeIcon /> : contentViewMode === "markdown" ? <FileImageIcon /> : <FilePlayIcon />}
              />
            </IconedButton>

            <IconedButton title="Toggle Edit and View modes" onClick={() => setReadOnly(!readOnly)}>
              <LucideIcon icon={readOnly ? <PencilOffIcon /> : <PencilIcon />} />
            </IconedButton>

            <IconedButton
              title="Open commands"
              className=""
              onClick={() => {
                useZustandStore.setState({ isCommandsOpened: true });
              }}
            >
              <LucideIcon icon={<SquareTerminalIcon />} />
            </IconedButton>

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
          </div>
        </div>

        <div className="ml-3 flex items-center justify-center">
          <MainMenu />
        </div>
      </div>
      {/* </div> */}
    </div>
  );
}

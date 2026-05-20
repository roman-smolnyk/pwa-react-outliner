import log from "loglevel";
import {
  CloudAlertIcon,
  CloudCheckIcon,
  CloudCogIcon,
  FileCodeIcon,
  FileImageIcon,
  FilePlayIcon,
  ListChecksIcon,
  ListIcon,
  MoonIcon,
  PanelLeftIcon,
  PencilIcon,
  PencilOffIcon,
  RedoIcon,
  RotateCwIcon,
  SearchIcon,
  SunIcon,
  SunMoonIcon,
  UndoIcon,
} from "lucide-react";
import { toast } from "react-toastify";
import { useContentViewMode } from "../../contexts/PlainTextViewContext";
import { useReadOnly } from "../../contexts/ReadOnlyContext";
import { useTheme } from "../../hooks/theme";
import useZustandStore from "../../store/useZustandStore";
import yjs from "../../store/yjsManager";
import Button from "../Common/Button";
import LucideIcon from "../Common/LucideIcon";
import MainMenu from "../MainMenu/MainMenu";

export default function Header() {
  log.debug("Header");
  const { readOnly, setReadOnly } = useReadOnly();
  const { contentViewMode, setContentViewMode } = useContentViewMode();
  const { theme, setTheme } = useTheme();

  const isExplorerOpened = useZustandStore((s) => s.isExplorerOpened);
  const isPageSearchActive = useZustandStore((s) => s.isPageSearchActive);
  const webSocketConnectionStatus = useZustandStore((s) => s.webSocketConnectionStatus);
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
            <Button
              title="Open Explorer"
              onClick={() => {
                useZustandStore.getState().expandExplorer();
              }}
            >
              <LucideIcon icon={<PanelLeftIcon />} />
            </Button>
          )}
        </div>

        <div className="flex-1 min-w-0 overflow-x-auto flex">
          <div className="LeftIcons min-w-max flex gap-4 sm:gap-2">
            <Button
              title="Undo"
              onClick={() => {
                yjs.undoManager?.undo();
              }}
            >
              <LucideIcon icon={<UndoIcon />} />
            </Button>
            <Button
              title="Redo"
              onClick={() => {
                yjs.undoManager?.redo();
              }}
            >
              <LucideIcon icon={<RedoIcon />} />
            </Button>
            {/* <div className="Spacer"></div> */}
            <Button
              title="Reload"
              onClick={(event) => {
                event.currentTarget.classList.add("animate-spin");
                window.location.replace(window.location.href);
              }}
            >
              <LucideIcon icon={<RotateCwIcon />} />
            </Button>
          </div>

          <div className="Spacer flex-1 min-w-4" />

          <div className="RightIcons flex gap-4 sm:gap-2">
            <Button
              title={`WebSocket: ${webSocketConnectionStatus}`}
              onClick={() => {
                toast(`WebSocket status: '${webSocketConnectionStatus}'`, { containerId: "toaster" });
              }}
            >
              {webSocketConnectionStatus === "connecting" && <LucideIcon icon={<CloudAlertIcon />} />}
              {webSocketConnectionStatus === "connected" && <LucideIcon icon={<CloudCheckIcon />} />}
              {/* {webSocketConnectionStatus === "disconnected" && <LucideIcon className="animate-spin" icon={<RefreshCwIcon />} />} */}
              {webSocketConnectionStatus === "disconnected" && <LucideIcon icon={<CloudAlertIcon />} />}
              {webSocketConnectionStatus === "turned off" && <LucideIcon icon={<CloudCogIcon />} />}
            </Button>

            <Button
              title={`Theme: ${theme}`}
              onClick={() => {
                log.debug("theme", theme);
                if (theme === "system") {
                  setTheme("light");
                } else if (theme === "light") {
                  setTheme("dark");
                } else if (theme === "dark") {
                  setTheme("system");
                }
              }}
            >
              <LucideIcon icon={theme === "system" ? <SunMoonIcon /> : theme === "light" ? <SunIcon /> : <MoonIcon />} />
            </Button>

            <Button
              title="Toggle checkboxes selection"
              className="text-warning"
              onClick={() => useZustandStore.setState({ isChekboxSelectionActive: !isChekboxSelectionActive })}
            >
              <LucideIcon icon={isChekboxSelectionActive ? <ListIcon /> : <ListChecksIcon />} />
            </Button>

            <Button
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
            </Button>

            <Button title="Toggle Edit and View modes" onClick={() => setReadOnly(!readOnly)}>
              <LucideIcon icon={readOnly ? <PencilOffIcon /> : <PencilIcon />} />
            </Button>

            <Button
              title="Search in page"
              className=""
              onClick={() => {
                useZustandStore.setState({ isPageSearchActive: !isPageSearchActive });
              }}
            >
              <LucideIcon icon={<SearchIcon />} />
            </Button>
          </div>
        </div>

        <div className="ml-3 flex">
          <MainMenu />
        </div>
      </div>
      {/* </div> */}
    </div>
  );
}

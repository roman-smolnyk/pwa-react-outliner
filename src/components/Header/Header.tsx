import {
  CloudAlertIcon,
  CloudCheckIcon,
  CloudCogIcon,
  FileCodeIcon,
  FileImageIcon,
  FilePlayIcon,
  ListChecksIcon,
  ListIcon,
  PanelLeftIcon,
  PencilIcon,
  PencilOffIcon,
  RedoIcon,
  RotateCwIcon,
  SearchIcon,
  UndoIcon,
} from "lucide-react";
import { toast } from "react-toastify";
import { useContentViewMode } from "../../contexts/PlainTextViewContext";
import { useReadOnly } from "../../contexts/ReadOnlyContext";
import useZustandStore from "../../store/useZustandStore";
import yjs from "../../store/yjsManager";
import Button from "../Common/Button";
import Menu from "../Menu/Menu";

export default function Header() {
  console.debug("Header");
  const { readOnly, setReadOnly } = useReadOnly();
  const { contentViewMode, setContentViewMode } = useContentViewMode();

  const isExplorerOpened = useZustandStore((s) => s.isExplorerOpened);
  const isPageSearchOpened = useZustandStore((s) => s.isPageSearchOpened);
  const webSocketConnectionStatus = useZustandStore((s) => s.webSocketConnectionStatus);
  const isChekboxSelectionActive = useZustandStore((s) => s.isChekboxSelectionActive);

  return (
    <div
      className="Header fixed top-0 right-0 min-w-0 min-h-12 sm:min-h-8 px-4 sm:px-2 z-10
      bg-white shadow-[0_1px_5px_rgba(0,0,0,0.15)]
      flex"
      style={{ left: `${isExplorerOpened ? "var(--explorer-width)" : "0px"}` }}
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
              <PanelLeftIcon />
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
              <UndoIcon />
            </Button>
            <Button
              title="Redo"
              onClick={() => {
                yjs.undoManager?.redo();
              }}
            >
              <RedoIcon />
            </Button>
            {/* <div className="Spacer"></div> */}
            <Button
              title="Reload"
              onClick={(event) => {
                event.currentTarget.classList.add("animate-spin");
                window.location.replace(window.location.href);
              }}
            >
              <RotateCwIcon />
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
              {webSocketConnectionStatus === "connecting" && <CloudAlertIcon />}
              {webSocketConnectionStatus === "connected" && <CloudCheckIcon />}
              {/* {webSocketConnectionStatus === "disconnected" && <RefreshCwIcon className="animate-spin" />} */}
              {webSocketConnectionStatus === "disconnected" && <CloudAlertIcon />}
              {webSocketConnectionStatus === "turned off" && <CloudCogIcon />}
            </Button>

            <Button
              title="Toggle checkboxes selection"
              className="text-yellow-400"
              onClick={() => useZustandStore.setState({ isChekboxSelectionActive: !isChekboxSelectionActive })}
            >
              {isChekboxSelectionActive ? <ListIcon /> : <ListChecksIcon />}
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
              {contentViewMode === "source" ? <FileCodeIcon /> : contentViewMode === "markdown" ? <FileImageIcon /> : <FilePlayIcon />}
            </Button>

            <Button title="Toggle Edit and View modes" onClick={() => setReadOnly(!readOnly)}>
              {readOnly ? <PencilOffIcon /> : <PencilIcon />}
            </Button>

            <Button
              title="Search in page"
              className="text-yellow-400"
              onClick={() => {
                useZustandStore.setState({ isPageSearchOpened: !isPageSearchOpened });
              }}
            >
              <SearchIcon />
            </Button>
          </div>
        </div>

        <div className="ml-3 flex">
          <Menu />
        </div>
      </div>
      {/* </div> */}
    </div>
  );
}

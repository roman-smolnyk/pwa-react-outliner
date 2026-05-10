import {
  ArrowDownIcon,
  ArrowLeftToLineIcon,
  ArrowRightToLineIcon,
  ArrowUpIcon,
  BoldIcon,
  BookImageIcon,
  BookTypeIcon,
  BracketsIcon,
  // CalendarDays,
  CloudAlertIcon,
  CloudCheckIcon,
  CloudCogIcon,
  Code2Icon,
  DiamondPlusIcon,
  HeadingIcon,
  HighlighterIcon,
  ItalicIcon,
  ListChecksIcon,
  ListIcon,
  PanelLeftIcon,
  // EllipsisVerticalIcon,
  PencilIcon,
  PencilOffIcon,
  QuoteIcon,
  RedoIcon,
  RefreshCwIcon,
  RotateCwIcon,
  SearchIcon,
  SigmaIcon,
  StrikethroughIcon,
  TableIcon,
  // ZoomInIcon,
  Trash2Icon,
  UndoIcon,
} from "lucide-react";
import { toast } from "react-toastify";
// import { useKeyboardOffset } from "../etc/utilities";
import Button from "../Common/Button";
import { useReadOnly } from "../../contexts/ReadOnlyContext";
import { usePlainTextView } from "../../contexts/PlainTextViewContext";
import useZustandStore from "../../store/useZustandStore";
import yjs from "../../store/yjsManager";
// import { forceReload } from "../etc/utilities";
import { type PanelImperativeHandle } from "react-resizable-panels";
import Menu from "../Menu/Menu";

export default function Header({ explorerPanelRef }: { explorerPanelRef: React.RefObject<PanelImperativeHandle | null> }) {
  const { readOnly, setReadOnly } = useReadOnly();
  const { plainTextView, setPlainTextView } = usePlainTextView();

  const isExplorerOpened = useZustandStore((state) => state.isExplorerOpened);
  const isPageSearchOpened = useZustandStore((state) => state.isPageSearchOpened);
  const webSocketConnectionStatus = useZustandStore((state) => state.webSocketConnectionStatus);
  const isChekboxSelectionActive = useZustandStore((state) => state.isChekboxSelectionActive);

  return (
    <div
      className="Header fixed top-0 right-0 min-w-0 min-h-10 sm:min-h-8 px-2 z-10
      bg-white shadow-[0_1px_5px_rgba(0,0,0,0.15)]
      flex"
      style={{ left: `${isExplorerOpened ? "var(--explorer-width)" : "0px"}` }}
    >
      {/* <div className="px-2 py-3 sm:py-1"> */}
      {/* Left icons */}

      <div className="flex-1 flex min-w-0">
        <div className="mr-3 flex">
          {!isExplorerOpened && (
            <Button
              title="Open Explorer"
              onClick={() => {
                useZustandStore.setState({ isExplorerOpened: true });
                explorerPanelRef?.current?.expand();
                explorerPanelRef.current?.resize("100%");
                console.debug(explorerPanelRef.current);
              }}
            >
              <PanelLeftIcon />
            </Button>
          )}
        </div>

        <div className="flex-1 min-w-0 overflow-x-auto flex">
          <div className="LeftIcons min-w-max flex gap-2">
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
            <div className="Spacer"></div>
            <Button
              title="Reload"
              onClick={(event) => {
                event.currentTarget.classList.add("animate-spin");
                window.location.replace(window.location.href);
                // forceReload();
              }}
            >
              <RotateCwIcon />
            </Button>
          </div>

          <div className="Spacer flex-1 min-w-4" />

          <div className="RightIcons flex gap-3 sm:gap-2">
            <Button
              title={`WebSocket: ${webSocketConnectionStatus}`}
              onClick={() => {
                toast(`WebSocket status: '${webSocketConnectionStatus}'`, {
                  containerId: "toaster",
                  className: "min-h-0! h-10! w-60! rounded-xl! top-5! sm:top-0! right-5! sm:right-0!",
                });
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
              onClick={() => useZustandStore.setState({ isChekboxSelectionActive: !isChekboxSelectionActive })}
            >
              {isChekboxSelectionActive ? <ListIcon /> : <ListChecksIcon />}
            </Button>

            <Button title="Toggle Markdown and Plain Text views" onClick={() => setPlainTextView(!plainTextView)}>
              {plainTextView ? <BookTypeIcon /> : <BookImageIcon />}
            </Button>

            <Button title="Toggle Edit and View modes" onClick={() => setReadOnly(!readOnly)}>
              {readOnly ? <PencilOffIcon /> : <PencilIcon />}
            </Button>

            <Button
              title="Search in page"
              onClick={() => {
                useZustandStore.setState({ isPageSearchOpened: !isPageSearchOpened });
              }}
            >
              <SearchIcon />
            </Button>

            <Menu />
          </div>
        </div>
      </div>
      {/* </div> */}
    </div>
  );
}

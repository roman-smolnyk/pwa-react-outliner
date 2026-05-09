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
import Button from "../common/Button";
import { useReadOnly } from "../../contexts/ReadOnlyContext";
import { usePlainTextView } from "../../contexts/PlainTextViewContext";
import useZustandStore from "../../store/useZustandStore";
import yjs from "../../store/yjsManager";
// import { forceReload } from "../etc/utilities";

export default function Footer() {
  const isExplorerOpened = useZustandStore((state) => state.isExplorerOpened);

  return (
    <div
      className="Footer fixed bottom-0 right-0 min-w-0 min-h-10 sm:min-h-8 px-2 z-10
               bg-white shadow-[0_-1px_5px_rgba(0,0,0,0.15)]
                 flex"
      style={{
        left: `${isExplorerOpened ? "var(--explorer-width)" : "0px"}`,
      }}
    >
      <div
        className="min-w-0 flex-1 
                  overflow-x-auto
                  flex gap-4 sm:gap-2 items-center justify-start sm:justify-center"
      >
        <Button
          title="Add block"
          onPointerDown={(e) => {
            e.preventDefault();
            // const activeNodeId = useZustandStore.getState().activeNodeId;
            // const newNodeId = TreeRoAPI.insertNewNodeAfter(activeNodeId);
            // // console.debug("onPointerDown", { activeNodeId, newNodeId });
            // if (newNodeId) {
            //   TreeRoAPI.useZustandStore.getState().activateNode(newNodeId);
            // }
          }}
        >
          {/* <SquarePlusIcon /> */}
          <DiamondPlusIcon />
        </Button>

        <Button
          title="Unindent"
          onPointerDown={(e) => {
            e.preventDefault();
            // TreeRoAPI.uiUnindentNode(TreeRoAPI.useZustandStore.getState().activeNodeId);
          }}
        >
          <ArrowLeftToLineIcon />
        </Button>

        <Button
          title="Indent"
          onPointerDown={(e) => {
            e.preventDefault();
            // TreeRoAPI.uiIndentNode(TreeRoAPI.useZustandStore.getState().activeNodeId);
          }}
        >
          <ArrowRightToLineIcon />
        </Button>

        <Button
          title="Move Up"
          onPointerDown={(e) => {
            e.preventDefault();
            // TreeRoAPI.uiMoveNodeUp(TreeRoAPI.useZustandStore.getState().activeNodeId);
          }}
        >
          <ArrowUpIcon />
        </Button>

        <Button
          title="Move Down"
          onPointerDown={(e) => {
            e.preventDefault();
            // TreeRoAPI.uiMoveNodeDown(TreeRoAPI.useZustandStore.getState().activeNodeId);
          }}
        >
          <ArrowDownIcon />
        </Button>

        {/* <Button className="text-yellow-400">
            <MoveIcon />
          </Button> */}

        {/* TODO: Increment existing `# ` on each click(cicle) -> `## ` */}
        <Button className="text-yellow-400">
          <HeadingIcon />
        </Button>

        <Button className="text-yellow-400">
          <BoldIcon />
        </Button>

        <Button className="text-yellow-400">
          <ItalicIcon />
        </Button>

        <Button className="text-yellow-400">
          <StrikethroughIcon />
        </Button>

        <Button className="text-yellow-400">
          <Code2Icon />
        </Button>

        <Button className="text-yellow-400">
          <BracketsIcon />
        </Button>

        <Button className="text-yellow-400">
          <HighlighterIcon />
        </Button>

        <Button className="text-yellow-400">
          <TableIcon />
        </Button>

        <Button className="text-yellow-400">
          <QuoteIcon />
        </Button>

        <Button className="text-yellow-400">
          <SigmaIcon />
        </Button>

        {/* <Button className="text-yellow-400">
            <CalendarDays />
          </Button> */}

        <Button
          // text-red-600
          className="DeleteNode"
          onPointerDown={(e) => {
            e.preventDefault();
            // TreeRoAPI.deleteNode(TreeRoAPI.useZustandStore.getState().activeNodeId);
          }}
        >
          <Trash2Icon />
        </Button>
      </div>
    </div>
  );
}

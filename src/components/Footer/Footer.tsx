import {
  ArrowDownIcon,
  ArrowLeftToLineIcon,
  ArrowRightToLineIcon,
  ArrowUpIcon,
  BoldIcon,
  BracketsIcon,
  Code2Icon,
  DiamondPlusIcon,
  HeadingIcon,
  HighlighterIcon,
  ItalicIcon,
  QuoteIcon,
  SigmaIcon,
  StrikethroughIcon,
  TableIcon,
  // ZoomInIcon,
  Trash2Icon,
} from "lucide-react";
import useZustandStore from "../../store/useZustandStore";
import Button from "../Common/Button";
import { handleBlockAdd, handleBlockDelete, handleBlockIndent, handleBlockMoveDown, handleBlockMoveUp, handleBlockOutdent } from "../../api/api";

export default function Footer() {
  console.debug("Footer");
  const isExplorerOpened = useZustandStore((s) => s.isExplorerOpened);
  const selectedBlockId = useZustandStore((s) => s.selectedBlockId);

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
            console.debug("onPointerDown", selectedBlockId);
            e.preventDefault();
            e.stopPropagation();
            if (selectedBlockId) {
              handleBlockAdd(selectedBlockId);
            }

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
          title="Outdent"
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (selectedBlockId) handleBlockOutdent(selectedBlockId);
          }}
        >
          <ArrowLeftToLineIcon />
        </Button>

        <Button
          title="Indent"
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (selectedBlockId) handleBlockIndent(selectedBlockId);
          }}
        >
          <ArrowRightToLineIcon />
        </Button>

        <Button
          title="Move Up"
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (selectedBlockId) handleBlockMoveUp(selectedBlockId);
          }}
        >
          <ArrowUpIcon />
        </Button>

        <Button
          title="Move Down"
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();

            if (selectedBlockId) handleBlockMoveDown(selectedBlockId);
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
            e.stopPropagation();
            if (selectedBlockId) {
              handleBlockDelete(selectedBlockId);
            }
            const button = e.currentTarget;
            button.classList.add("scale-90");
            setTimeout(() => {
              button.classList.remove("scale-90");
            }, 100);
          }}
        >
          <Trash2Icon />
        </Button>
      </div>
    </div>
  );
}

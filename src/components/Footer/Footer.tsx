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
import { isMobile } from "../../utils/utilities";

export default function Footer() {
  console.debug("Footer");
  const isExplorerOpened = useZustandStore((s) => s.isExplorerOpened);
  const selectedBlockId = useZustandStore((s) => s.selectedBlockId);

  // if (!isMobile()) {
  //   return null;
  // }

  return (
    <div
      className="Footer fixed bottom-0 right-0 min-w-0 min-h-12 sm:min-h-8 px-4 sm:px-2 z-10
               bg-white shadow-[0_-1px_5px_rgba(0,0,0,0.15)]
                 flex"
      style={{
        left: `${isExplorerOpened ? "var(--explorer-width)" : "0px"}`,
      }}
    >
      <div
        className="flex-1 min-w-0 pb-2 sm:pb-0
                  overflow-x-auto
                  flex gap-4 sm:gap-2 items-center justify-start sm:justify-center"
      >
        <Button
          title="Add block"
          className="AddBlock"
          data-ignore-blur="true"
          onClick={(e) => {
            console.debug("onClick", selectedBlockId);
            if (selectedBlockId) {
              handleBlockAdd(selectedBlockId);
            }
          }}
        >
          {/* <SquarePlusIcon /> */}
          <DiamondPlusIcon />
        </Button>

        <Button
          title="Outdent"
          data-ignore-blur="true"
          onClick={(e) => {
            if (selectedBlockId) handleBlockOutdent(selectedBlockId);
          }}
        >
          <ArrowLeftToLineIcon />
        </Button>

        <Button
          title="Indent"
          data-ignore-blur="true"
          onClick={(e) => {
            if (selectedBlockId) handleBlockIndent(selectedBlockId);
          }}
        >
          <ArrowRightToLineIcon />
        </Button>

        <Button
          title="Move Up"
          data-ignore-blur="true"
          onClick={(e) => {
            if (selectedBlockId) handleBlockMoveUp(selectedBlockId);
          }}
        >
          <ArrowUpIcon />
        </Button>

        <Button
          title="Move Down"
          className="MoveBlockDown"
          data-ignore-blur="true"
          onClick={(e) => {
            if (selectedBlockId) handleBlockMoveDown(selectedBlockId);
          }}
        >
          <ArrowDownIcon />
        </Button>

        <Button
          className="DeleteNode"
          data-ignore-blur="true"
          onClick={(e) => {
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
      </div>
    </div>
  );
}

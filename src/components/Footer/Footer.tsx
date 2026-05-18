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
import { handleBlockAdd, handleBlockDelete, handleBlockIndent, handleBlockMoveDown, handleBlockMoveUp, handleBlockOutdent } from "../../api/api";
import useZustandStore from "../../store/useZustandStore";
import Button from "../Common/Button";
import LucideIcon from "../Common/LucideIcon";

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
                bg-sidebar text-sidebar-foreground border-t border-border
                flex"
      style={{
        left: `${isExplorerOpened ? "var(--explorer-width)" : "0px"}`,
        // boxShadow: "0px -1px 5px 0px light-dark(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.8))",
        // clipPath: "inset(-20px 0px 0px 0px)",
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
          <LucideIcon icon={<DiamondPlusIcon />} />
        </Button>

        <Button
          title="Outdent"
          data-ignore-blur="true"
          onClick={(e) => {
            if (selectedBlockId) handleBlockOutdent(selectedBlockId);
          }}
        >
          <LucideIcon icon={<ArrowLeftToLineIcon />} />
        </Button>

        <Button
          title="Indent"
          data-ignore-blur="true"
          onClick={(e) => {
            if (selectedBlockId) handleBlockIndent(selectedBlockId);
          }}
        >
          <LucideIcon icon={<ArrowRightToLineIcon />} />
        </Button>

        <Button
          title="Move Up"
          data-ignore-blur="true"
          onClick={(e) => {
            if (selectedBlockId) handleBlockMoveUp(selectedBlockId);
          }}
        >
          <LucideIcon icon={<ArrowUpIcon />} />
        </Button>

        <Button
          title="Move Down"
          className="MoveBlockDown"
          data-ignore-blur="true"
          onClick={(e) => {
            if (selectedBlockId) handleBlockMoveDown(selectedBlockId);
          }}
        >
          <LucideIcon icon={<ArrowDownIcon />} />
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
          <LucideIcon icon={<Trash2Icon />} />
        </Button>

        {/* <Button className="text-theme-warning">
            <MoveIcon />
          </Button> */}

        {/* TODO: Increment existing `# ` on each click(cicle) -> `## ` */}
        <Button>
          <LucideIcon icon={<HeadingIcon className="text-theme-warning" />} />
        </Button>

        <Button>
          <LucideIcon icon={<BoldIcon className="text-theme-warning" />} />
        </Button>

        <Button>
          <LucideIcon icon={<ItalicIcon className="text-theme-warning" />} />
        </Button>

        <Button>
          <LucideIcon icon={<StrikethroughIcon className="text-theme-warning" />} />
        </Button>

        <Button>
          <LucideIcon icon={<Code2Icon className="text-theme-warning" />} />
        </Button>

        <Button>
          <LucideIcon icon={<BracketsIcon className="text-theme-warning" />} />
        </Button>

        <Button>
          <LucideIcon icon={<HighlighterIcon className="text-theme-warning" />} />
        </Button>

        <Button>
          <LucideIcon icon={<TableIcon className="text-theme-warning" />} />
        </Button>

        <Button>
          <LucideIcon icon={<QuoteIcon className="text-theme-warning" />} />
        </Button>

        <Button>
          <LucideIcon icon={<SigmaIcon className="text-theme-warning" />} />
        </Button>

        {/* <Button className="text-theme-warning">
            <LucideIcon icon={<CalendarDays />} />
          </Button> */}
      </div>
    </div>
  );
}

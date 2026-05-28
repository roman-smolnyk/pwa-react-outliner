import log from "loglevel";
import {
  ArrowDownIcon,
  ArrowLeftToLineIcon,
  ArrowRightToLineIcon,
  ArrowUpIcon,
  BoldIcon,
  BracesIcon,
  BracketsIcon,
  Code2Icon,
  DiamondPlusIcon,
  HeadingIcon,
  HighlighterIcon,
  ItalicIcon,
  ParenthesesIcon,
  QuoteIcon,
  SigmaIcon,
  StrikethroughIcon,
  TableIcon,
  // ZoomInIcon,
  Trash2Icon,
} from "lucide-react";
import {
  handleBlockAdd,
  handleBlockDelete,
  handleBlockDeleteBatch,
  handleBlockIndent,
  handleBlockMoveDown,
  handleBlockMoveUp,
  handleBlockOutdent,
} from "../../api/api";
import useZustandStore from "../../store/useZustandStore";
import IconedButton from "../Common/IconedButton";
import LucideIcon from "../Common/LucideIcon";
import { addHeading, toggleInlineFormatting } from "../Editor/CM6Common";

export default function Footer() {
  log.debug("Footer");
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
        <IconedButton
          title="Add block"
          className="AddBlock"
          data-ignore-blur="true"
          onClick={(e) => {
            log.debug("onClick", selectedBlockId);
            if (selectedBlockId) {
              handleBlockAdd(selectedBlockId);
            }
          }}
        >
          {/* <SquarePlusIcon /> */}
          <LucideIcon icon={<DiamondPlusIcon />} />
        </IconedButton>

        <IconedButton
          title="Outdent"
          data-ignore-blur="true"
          onClick={(e) => {
            if (selectedBlockId) handleBlockOutdent(selectedBlockId);
          }}
        >
          <LucideIcon icon={<ArrowLeftToLineIcon />} />
        </IconedButton>

        <IconedButton
          title="Indent"
          data-ignore-blur="true"
          onClick={(e) => {
            if (selectedBlockId) handleBlockIndent(selectedBlockId);
          }}
        >
          <LucideIcon icon={<ArrowRightToLineIcon />} />
        </IconedButton>

        <IconedButton
          title="Move Up"
          data-ignore-blur="true"
          onClick={(e) => {
            if (selectedBlockId) handleBlockMoveUp(selectedBlockId);
          }}
        >
          <LucideIcon icon={<ArrowUpIcon />} />
        </IconedButton>

        <IconedButton
          title="Move Down"
          className="MoveBlockDown"
          data-ignore-blur="true"
          onClick={(e) => {
            if (selectedBlockId) handleBlockMoveDown(selectedBlockId);
          }}
        >
          <LucideIcon icon={<ArrowDownIcon />} />
        </IconedButton>

        <IconedButton
          className="DeleteBlock"
          data-ignore-blur="true"
          onClick={(e) => {
            if (selectedBlockId) {
              handleBlockDelete(selectedBlockId);
            } else if (useZustandStore.getState().isChekboxSelectionActive) {
              handleBlockDeleteBatch();
            }
            const button = e.currentTarget;
            button.classList.add("scale-90");
            setTimeout(() => {
              button.classList.remove("scale-90");
            }, 100);
          }}
        >
          <LucideIcon icon={<Trash2Icon />} />
        </IconedButton>

        {/* <Button className="text-warning">
            <MoveIcon />
          </Button> */}

        {/* TODO: Increment existing `# ` on each click(cicle) -> `## ` */}
        <IconedButton
          className="AddHeading"
          data-ignore-blur="true"
          onPointerDown={(e) => {
            log.debug("onPointerDown", e.pointerType);
            e.preventDefault();
            if (e.pointerType !== "touch") {
              const { selectedBlockId, editorView } = useZustandStore.getState();
              if (selectedBlockId && editorView) {
                addHeading(editorView);
              }
            }
          }}
          onPointerUpCapture={(e) => {
            log.debug("onPointerUpCapture", e.pointerType);
            e.preventDefault();
            if (e.pointerType === "touch") {
              const { selectedBlockId, editorView } = useZustandStore.getState();
              log.debug("onPointerUpCapture", selectedBlockId, editorView);
              if (selectedBlockId && editorView) {
                addHeading(editorView);
              }
            }
          }}
        >
          <LucideIcon icon={<HeadingIcon className="" />} />
        </IconedButton>

        <IconedButton
          className="MakeBold"
          data-ignore-blur="true"
          onPointerDown={(e) => {
            log.debug("onPointerDown", e.pointerType);
            e.preventDefault();
            if (e.pointerType !== "touch") {
              const { selectedBlockId, editorView } = useZustandStore.getState();
              if (selectedBlockId && editorView) {
                toggleInlineFormatting(editorView, "**");
              }
            }
          }}
          onPointerUpCapture={(e) => {
            log.debug("onPointerUpCapture", e.pointerType);
            e.preventDefault();
            if (e.pointerType === "touch") {
              const { selectedBlockId, editorView } = useZustandStore.getState();
              log.debug("onPointerUpCapture", selectedBlockId, editorView);
              if (selectedBlockId && editorView) {
                toggleInlineFormatting(editorView, "**");
              }
            }
          }}
        >
          <LucideIcon icon={<BoldIcon className="" />} />
        </IconedButton>

        <IconedButton
          className="MakeItalic"
          data-ignore-blur="true"
          onPointerDown={(e) => {
            log.debug("onPointerDown", e.pointerType);
            e.preventDefault();
            if (e.pointerType !== "touch") {
              const { selectedBlockId, editorView } = useZustandStore.getState();
              if (selectedBlockId && editorView) {
                toggleInlineFormatting(editorView, "_");
              }
            }
          }}
          onPointerUpCapture={(e) => {
            log.debug("onPointerUpCapture", e.pointerType);
            e.preventDefault();
            if (e.pointerType === "touch") {
              const { selectedBlockId, editorView } = useZustandStore.getState();
              log.debug("onPointerUpCapture", selectedBlockId, editorView);
              if (selectedBlockId && editorView) {
                toggleInlineFormatting(editorView, "_");
              }
            }
          }}
        >
          <LucideIcon icon={<ItalicIcon className="" />} />
        </IconedButton>

        <IconedButton
          className="MakeStrike"
          data-ignore-blur="true"
          onPointerDown={(e) => {
            log.debug("onPointerDown", e.pointerType);
            e.preventDefault();
            if (e.pointerType !== "touch") {
              const { selectedBlockId, editorView } = useZustandStore.getState();
              if (selectedBlockId && editorView) {
                toggleInlineFormatting(editorView, "~~");
              }
            }
          }}
          onPointerUpCapture={(e) => {
            log.debug("onPointerUpCapture", e.pointerType);
            e.preventDefault();
            if (e.pointerType === "touch") {
              const { selectedBlockId, editorView } = useZustandStore.getState();
              log.debug("onPointerUpCapture", selectedBlockId, editorView);
              if (selectedBlockId && editorView) {
                toggleInlineFormatting(editorView, "~~");
              }
            }
          }}
        >
          <LucideIcon icon={<StrikethroughIcon className="" />} />
        </IconedButton>

        <IconedButton
          className="MakeCode"
          data-ignore-blur="true"
          onPointerDown={(e) => {
            log.debug("onPointerDown", e.pointerType);
            e.preventDefault();
            if (e.pointerType !== "touch") {
              const { selectedBlockId, editorView } = useZustandStore.getState();
              if (selectedBlockId && editorView) {
                toggleInlineFormatting(editorView, "```\n");
              }
            }
          }}
          onPointerUpCapture={(e) => {
            log.debug("onPointerUpCapture", e.pointerType);
            e.preventDefault();
            if (e.pointerType === "touch") {
              const { selectedBlockId, editorView } = useZustandStore.getState();
              log.debug("onPointerUpCapture", selectedBlockId, editorView);
              if (selectedBlockId && editorView) {
                toggleInlineFormatting(editorView, "```\n");
              }
            }
          }}
        >
          <LucideIcon icon={<Code2Icon className="" />} />
        </IconedButton>

        <IconedButton>
          <LucideIcon icon={<BracketsIcon className="text-warning" />} />
        </IconedButton>

        <IconedButton>
          <LucideIcon icon={<ParenthesesIcon className="text-warning" />} />
        </IconedButton>

        <IconedButton>
          <LucideIcon icon={<BracesIcon className="text-warning" />} />
        </IconedButton>

        <IconedButton>
          <LucideIcon icon={<HighlighterIcon className="text-warning" />} />
        </IconedButton>

        <IconedButton>
          <LucideIcon icon={<TableIcon className="text-warning" />} />
        </IconedButton>

        <IconedButton>
          <LucideIcon icon={<QuoteIcon className="text-warning" />} />
        </IconedButton>

        <IconedButton>
          <LucideIcon icon={<SigmaIcon className="text-warning" />} />
        </IconedButton>

        {/* <Button className="text-warning">
            <LucideIcon icon={<CalendarDays />} />
          </Button> */}
      </div>
    </div>
  );
}

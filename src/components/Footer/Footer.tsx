import { Button } from "@/components/ui/button";
import yjs from "@/store/yjsManager";
import log from "loglevel";
import {
  ArrowDownIcon,
  ArrowLeftToLineIcon,
  ArrowRightToLineIcon,
  ArrowUpIcon,
  BoldIcon,
  BracesIcon,
  BracketsIcon,
  CalendarDaysIcon,
  Code2Icon,
  DiamondPlusIcon,
  HeadingIcon,
  HighlighterIcon,
  ItalicIcon,
  ParenthesesIcon,
  QuoteIcon,
  RedoIcon,
  SigmaIcon,
  StrikethroughIcon,
  TableIcon,
  // ZoomInIcon,
  Trash2Icon,
  UndoIcon,
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
import useStore from "../../store/useStore";
import { addHeading, toggleInlineFormatting } from "../Editor/CM6Common";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export default function Footer() {
  log.debug("Footer");
  const isExplorerOpen = useStore((s) => s.isExplorerOpen);
  const selectedBlockId = useStore((s) => s.selectedBlockId);

  return (
    <div
      className="Footer fixed bottom-0 right-0 min-w-0 min-h-12 px-4 z-10
                bg-sidebar text-sidebar-foreground border-t border-border
                flex
                "
      style={{
        left: `${isExplorerOpen ? "var(--explorer-width)" : "0px"}`,
        // boxShadow: "0px -1px 5px 0px light-dark(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.8))",
        // clipPath: "inset(-20px 0px 0px 0px)",
      }}
    >
      <div
        className="flex-1 min-w-0 pb-2
                  overflow-x-auto overscroll-contain
                  flex items-center justify-start"
      >
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="bare"
                size="tool"
                data-ignore-blur="true"
                onClick={() => {
                  yjs.undoManager?.undo();
                }}
              >
                <UndoIcon />
              </Button>
            }
          />
          <TooltipContent>
            Undo changes
            <KbdGroup>
              <Kbd>Ctrl</Kbd>
              <span>+</span>
              <Kbd>Z</Kbd>
            </KbdGroup>
          </TooltipContent>
        </Tooltip>

        <Button
          variant="bare"
          size="tool"
          title="Redo"
          data-ignore-blur="true"
          onClick={() => {
            yjs.undoManager?.redo();
          }}
        >
          <RedoIcon />
        </Button>

        <Button
          variant="bare"
          size="tool"
          title="Add block"
          data-ignore-blur="true"
          onClick={(e) => {
            log.debug("onClick", selectedBlockId);
            if (selectedBlockId) {
              handleBlockAdd(selectedBlockId);
            }
          }}
        >
          <DiamondPlusIcon />
        </Button>

        <Button
          variant="bare"
          size="tool"
          title="Outdent"
          data-ignore-blur="true"
          onClick={(e) => {
            if (selectedBlockId) handleBlockOutdent(selectedBlockId);
          }}
        >
          <ArrowLeftToLineIcon />
        </Button>

        <Button
          variant="bare"
          size="tool"
          title="Indent"
          data-ignore-blur="true"
          onClick={(e) => {
            if (selectedBlockId) handleBlockIndent(selectedBlockId);
          }}
        >
          <ArrowRightToLineIcon />
        </Button>

        <Button
          variant="bare"
          size="tool"
          title="Move Up"
          data-ignore-blur="true"
          onClick={(e) => {
            if (selectedBlockId) handleBlockMoveUp(selectedBlockId);
          }}
        >
          <ArrowUpIcon />
        </Button>

        <Button
          variant="bare"
          size="tool"
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
          variant="bare"
          size="tool"
          className="DeleteBlock"
          data-ignore-blur="true"
          onClick={(e) => {
            if (selectedBlockId) {
              handleBlockDelete(selectedBlockId);
            } else if (useStore.getState().isCheckboxSelectionActive) {
              handleBlockDeleteBatch();
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

        {/* <Button className="text-warning">
            <MoveIcon />
          </Button> */}

        {/* TODO: Increment existing `# ` on each click(cicle) -> `## ` */}
        <Button
          variant="bare"
          size="tool"
          className="AddHeading"
          data-ignore-blur="true"
          onPointerDown={(e) => {
            log.debug("onPointerDown", e.pointerType);
            e.preventDefault();
            if (e.pointerType !== "touch") {
              const { selectedBlockId, editorView } = useStore.getState();
              if (selectedBlockId && editorView) {
                addHeading(editorView);
              }
            }
          }}
          onPointerUpCapture={(e) => {
            log.debug("onPointerUpCapture", e.pointerType);
            e.preventDefault();
            if (e.pointerType === "touch") {
              const { selectedBlockId, editorView } = useStore.getState();
              log.debug("onPointerUpCapture", selectedBlockId, editorView);
              if (selectedBlockId && editorView) {
                addHeading(editorView);
              }
            }
          }}
        >
          <HeadingIcon className="" />
        </Button>

        <Button
          variant="bare"
          size="tool"
          className="MakeBold"
          data-ignore-blur="true"
          onPointerDown={(e) => {
            log.debug("onPointerDown", e.pointerType);
            e.preventDefault();
            if (e.pointerType !== "touch") {
              const { selectedBlockId, editorView } = useStore.getState();
              if (selectedBlockId && editorView) {
                toggleInlineFormatting(editorView, "**");
              }
            }
          }}
          onPointerUpCapture={(e) => {
            log.debug("onPointerUpCapture", e.pointerType);
            e.preventDefault();
            if (e.pointerType === "touch") {
              const { selectedBlockId, editorView } = useStore.getState();
              log.debug("onPointerUpCapture", selectedBlockId, editorView);
              if (selectedBlockId && editorView) {
                toggleInlineFormatting(editorView, "**");
              }
            }
          }}
        >
          <BoldIcon className="" />
        </Button>

        <Button
          variant="bare"
          size="tool"
          className="MakeItalic"
          data-ignore-blur="true"
          onPointerDown={(e) => {
            log.debug("onPointerDown", e.pointerType);
            e.preventDefault();
            if (e.pointerType !== "touch") {
              const { selectedBlockId, editorView } = useStore.getState();
              if (selectedBlockId && editorView) {
                toggleInlineFormatting(editorView, "_");
              }
            }
          }}
          onPointerUpCapture={(e) => {
            log.debug("onPointerUpCapture", e.pointerType);
            e.preventDefault();
            if (e.pointerType === "touch") {
              const { selectedBlockId, editorView } = useStore.getState();
              log.debug("onPointerUpCapture", selectedBlockId, editorView);
              if (selectedBlockId && editorView) {
                toggleInlineFormatting(editorView, "_");
              }
            }
          }}
        >
          <ItalicIcon />
        </Button>

        <Button
          variant="bare"
          size="tool"
          className="MakeStrike"
          data-ignore-blur="true"
          onPointerDown={(e) => {
            log.debug("onPointerDown", e.pointerType);
            e.preventDefault();
            if (e.pointerType !== "touch") {
              const { selectedBlockId, editorView } = useStore.getState();
              if (selectedBlockId && editorView) {
                toggleInlineFormatting(editorView, "~~");
              }
            }
          }}
          onPointerUpCapture={(e) => {
            log.debug("onPointerUpCapture", e.pointerType);
            e.preventDefault();
            if (e.pointerType === "touch") {
              const { selectedBlockId, editorView } = useStore.getState();
              log.debug("onPointerUpCapture", selectedBlockId, editorView);
              if (selectedBlockId && editorView) {
                toggleInlineFormatting(editorView, "~~");
              }
            }
          }}
        >
          <StrikethroughIcon />
        </Button>

        <Button
          variant="bare"
          size="tool"
          className="MakeCode"
          data-ignore-blur="true"
          onPointerDown={(e) => {
            log.debug("onPointerDown", e.pointerType);
            e.preventDefault();
            if (e.pointerType !== "touch") {
              const { selectedBlockId, editorView } = useStore.getState();
              if (selectedBlockId && editorView) {
                toggleInlineFormatting(editorView, "```\n");
              }
            }
          }}
          onPointerUpCapture={(e) => {
            log.debug("onPointerUpCapture", e.pointerType);
            e.preventDefault();
            if (e.pointerType === "touch") {
              const { selectedBlockId, editorView } = useStore.getState();
              log.debug("onPointerUpCapture", selectedBlockId, editorView);
              if (selectedBlockId && editorView) {
                toggleInlineFormatting(editorView, "```\n");
              }
            }
          }}
        >
          <Code2Icon />
        </Button>

        <Button variant="bare" size="tool">
          <BracketsIcon className="text-warning" />
        </Button>

        <Button variant="bare" size="tool">
          <ParenthesesIcon className="text-warning" />
        </Button>

        <Button variant="bare" size="tool">
          <BracesIcon className="text-warning" />
        </Button>
        <Button variant="bare" size="tool">
          <HighlighterIcon className="text-warning" />
        </Button>

        <Button variant="bare" size="tool">
          <TableIcon className="text-warning" />
        </Button>

        <Button variant="bare" size="tool">
          <QuoteIcon className="text-warning" />
        </Button>

        <Button variant="bare" size="tool">
          <SigmaIcon className="text-warning" />
        </Button>

        <Button variant="bare" size="tool">
          <CalendarDaysIcon className="text-warning" />
        </Button>
      </div>
    </div>
  );
}

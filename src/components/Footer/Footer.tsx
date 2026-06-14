import { Button } from "@/components/ui/button";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import log from "loglevel";
import {
  ArrowDownIcon,
  ArrowLeftToLineIcon,
  ArrowRightToLineIcon,
  ArrowUpIcon,
  BadgeAlertIcon,
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
import { useShallow } from "zustand/react/shallow";
import {
  handleBlockAdd,
  handleBlockDelete,
  handleBlockIndent,
  handleBlockMoveDown,
  handleBlockMoveUp,
  handleBlockOutdent,
  handleRedo,
  handleUndo,
} from "../../api/api";
import useStore from "../../store/useStore";
import { addHeading, toggleInlineFormatting } from "../Editor/CM6Common";

export default function Footer() {
  log.debug("Footer");

  const { activeBlockId, editorView } = useStore(
    useShallow((s) => ({
      activeBlockId: s.activeBlockId,
      editorView: s.editorView,
    })),
  );

  return (
    <div
      className="Footer fixed bottom-0 right-0 min-w-0 min-h-12 px-2 z-10
                bg-sidebar text-sidebar-foreground border-t border-border
                flex
                "
      style={{
        left: "var(--explorer-width)",
        // boxShadow: "0px -1px 5px 0px light-dark(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.8))",
        // clipPath: "inset(-20px 0px 0px 0px)",
      }}
      ref={(el) => {
        useStore.setState({ footerElement: el });
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
                className="Undo"
                onClick={() => {
                  if (activeBlockId) {
                    useStore.getState().inputFocusKeeperElement?.focus();
                  }
                  handleUndo();
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
          className="Redo"
          onClick={() => {
            if (activeBlockId) {
              useStore.getState().inputFocusKeeperElement?.focus();
            }
            handleRedo();
          }}
        >
          <RedoIcon />
        </Button>

        <Button
          variant="bare"
          size="tool"
          title="Add block"
          className="AddBlock"
          onClick={(e) => {
            if (activeBlockId) {
              useStore.getState().inputFocusKeeperElement?.focus();
              handleBlockAdd(activeBlockId);
            }
          }}
        >
          <DiamondPlusIcon />
        </Button>

        <Button
          variant="bare"
          size="tool"
          title="Outdent"
          className="MoveBlockLeft"
          onClick={(e) => {
            if (activeBlockId) {
              useStore.getState().inputFocusKeeperElement?.focus();
              handleBlockOutdent(activeBlockId);
            }
          }}
        >
          <ArrowLeftToLineIcon />
        </Button>

        <Button
          variant="bare"
          size="tool"
          title="Indent"
          className="MoveBlockRight"
          onClick={(e) => {
            if (activeBlockId) {
              useStore.getState().inputFocusKeeperElement?.focus();
              handleBlockIndent(activeBlockId);
            }
          }}
        >
          <ArrowRightToLineIcon />
        </Button>

        <Button
          variant="bare"
          size="tool"
          title="Move Up"
          className="MoveBlockUp"
          onClick={(e) => {
            if (activeBlockId) {
              useStore.getState().inputFocusKeeperElement?.focus();
              handleBlockMoveUp(activeBlockId);
            }
          }}
        >
          <ArrowUpIcon />
        </Button>

        <Button
          variant="bare"
          size="tool"
          title="Move Down"
          className="MoveBlockDown"
          onClick={(e) => {
            if (activeBlockId) {
              useStore.getState().inputFocusKeeperElement?.focus();

              handleBlockMoveDown(activeBlockId);
            }
          }}
        >
          <ArrowDownIcon />
        </Button>

        <Button
          variant="bare"
          size="tool"
          className="DeleteBlock"
          onClick={(e) => {
            if (activeBlockId) {
              handleBlockDelete(activeBlockId);
            }
          }}
        >
          <Trash2Icon />
        </Button>

        <Button
          variant="bare"
          size="tool"
          className="AddHeading"
          onClick={(e) => {
            if (activeBlockId && editorView) {
              useStore.getState().inputFocusKeeperElement?.focus();
              addHeading(editorView);
            }
          }}
        >
          <HeadingIcon className="" />
        </Button>

        <Button
          variant="bare"
          size="tool"
          className="MakeBold"
          onClick={(e) => {
            if (activeBlockId && editorView) {
              useStore.getState().inputFocusKeeperElement?.focus();
              toggleInlineFormatting(editorView, "**");
            }
          }}
        >
          <BoldIcon className="" />
        </Button>

        <Button
          variant="bare"
          size="tool"
          className="MakeItalic"
          onClick={(e) => {
            if (activeBlockId && editorView) {
              useStore.getState().inputFocusKeeperElement?.focus();
              toggleInlineFormatting(editorView, "_");
            }
          }}
        >
          <ItalicIcon />
        </Button>

        <Button
          variant="bare"
          size="tool"
          className="MakeStrike"
          onClick={(e) => {
            if (activeBlockId && editorView) {
              useStore.getState().inputFocusKeeperElement?.focus();
              toggleInlineFormatting(editorView, "~~");
            }
          }}
        >
          <StrikethroughIcon />
        </Button>

        <Button
          variant="bare"
          size="tool"
          className="MakeCode"
          onClick={(e) => {
            if (activeBlockId && editorView) {
              useStore.getState().inputFocusKeeperElement?.focus();
              toggleInlineFormatting(editorView, { open: "```\n", close: "\n```" });
            }
          }}
        >
          <Code2Icon />
        </Button>

        <Button
          variant="bare"
          size="tool"
          className="MakeSpoiler"
          onClick={(e) => {
            if (activeBlockId && editorView) {
              useStore.getState().inputFocusKeeperElement?.focus();
              toggleInlineFormatting(editorView, "||");
            }
          }}
        >
          <BadgeAlertIcon />
        </Button>

        <Button
          variant="bare"
          size="tool"
          className="MakeHighlight"
          onClick={(e) => {
            if (activeBlockId && editorView) {
              useStore.getState().inputFocusKeeperElement?.focus();
              toggleInlineFormatting(editorView, "==");
            }
          }}
        >
          <HighlighterIcon />
        </Button>

        <Button
          variant="bare"
          size="tool"
          className="MakeBrackets"
          onClick={(e) => {
            if (activeBlockId && editorView) {
              useStore.getState().inputFocusKeeperElement?.focus();
              toggleInlineFormatting(editorView, { open: "[", close: "]" });
            }
          }}
        >
          <BracketsIcon />
        </Button>

        <Button
          variant="bare"
          size="tool"
          className="MakeParentheses"
          onClick={(e) => {
            if (activeBlockId && editorView) {
              useStore.getState().inputFocusKeeperElement?.focus();
              toggleInlineFormatting(editorView, { open: "(", close: ")" });
            }
          }}
        >
          <ParenthesesIcon />
        </Button>

        <Button
          variant="bare"
          size="tool"
          className="MakeBraces"
          onClick={(e) => {
            if (activeBlockId && editorView) {
              useStore.getState().inputFocusKeeperElement?.focus();
              toggleInlineFormatting(editorView, { open: "{", close: "}" });
            }
          }}
        >
          <BracesIcon />
        </Button>

        <Button
          variant="bare"
          size="tool"
          className="MakeMath"
          onClick={(e) => {
            if (activeBlockId && editorView) {
              useStore.getState().inputFocusKeeperElement?.focus();
              toggleInlineFormatting(editorView, { open: "$$", close: "$$" });
            }
          }}
        >
          <SigmaIcon />
        </Button>

        <Button variant="bare" size="tool">
          <QuoteIcon className="text-warning" />
        </Button>

        <Button variant="bare" size="tool">
          <TableIcon className="text-warning" />
        </Button>

        <Button variant="bare" size="tool">
          <CalendarDaysIcon className="text-warning" />
        </Button>
      </div>
    </div>
  );
}

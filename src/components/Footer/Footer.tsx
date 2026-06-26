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
  FormIcon,
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
import ToolButton from "../Common/ToolButton";
import { addHeading, toggleInlineFormatting } from "../Editor/CM6Hotkeys";

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
      data-component="Footer"
      className="fixed bottom-0 right-0 min-w-0 min-h-12 px-2 z-10
                bg-sidebar text-sidebar-foreground
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
        <ToolButton
          tooltip="Undo changes"
          icon={<UndoIcon />}
          hotkey={["⌘", "Z"]}
          onClick={() => {
            if (activeBlockId) {
              useStore.getState().inputFocusKeeperElement?.focus();
            }
            handleUndo();
          }}
        />

        <ToolButton
          tooltip="Redo changes"
          icon={<RedoIcon />}
          hotkey={["⌘", "Shift", "Z"]}
          onClick={() => {
            if (activeBlockId) useStore.getState().inputFocusKeeperElement?.focus();
            handleRedo();
          }}
        />

        <ToolButton
          tooltip="Add block"
          icon={<DiamondPlusIcon />}
          hotkey={["⌘", "Enter"]}
          onClick={() => {
            if (activeBlockId) {
              useStore.getState().inputFocusKeeperElement?.focus();
              handleBlockAdd(activeBlockId);
            }
          }}
        />

        <ToolButton
          tooltip="Outdent block"
          icon={<ArrowLeftToLineIcon />}
          hotkey={["⌘", "←"]}
          onClick={() => {
            if (activeBlockId) {
              useStore.getState().inputFocusKeeperElement?.focus();
              handleBlockOutdent(activeBlockId);
            }
          }}
        />

        <ToolButton
          tooltip="Indent block"
          icon={<ArrowRightToLineIcon />}
          hotkey={["⌘", "→"]}
          onClick={() => {
            if (activeBlockId) {
              useStore.getState().inputFocusKeeperElement?.focus();
              handleBlockIndent(activeBlockId);
            }
          }}
        />

        <ToolButton
          tooltip="Move block up"
          icon={<ArrowUpIcon />}
          hotkey={["⌘", "↑"]}
          onClick={() => {
            if (activeBlockId) {
              useStore.getState().inputFocusKeeperElement?.focus();
              handleBlockMoveUp(activeBlockId);
            }
          }}
        />

        <ToolButton
          tooltip="Move block down"
          icon={<ArrowDownIcon />}
          hotkey={["⌘", "↓"]}
          onClick={() => {
            if (activeBlockId) {
              useStore.getState().inputFocusKeeperElement?.focus();
              handleBlockMoveDown(activeBlockId);
            }
          }}
        />

        <ToolButton
          tooltip="Delete block"
          icon={<Trash2Icon />}
          onClick={() => {
            if (activeBlockId) {
              handleBlockDelete(activeBlockId);
            }
          }}
        />

        {/* --- Formatting Actions --- */}
        <ToolButton
          tooltip="Add heading"
          icon={<HeadingIcon />}
          onClick={() => {
            if (activeBlockId && editorView) {
              useStore.getState().inputFocusKeeperElement?.focus();
              addHeading(editorView);
            }
          }}
        />

        <ToolButton
          tooltip="Make text bold"
          icon={<BoldIcon />}
          onClick={() => {
            if (activeBlockId && editorView) {
              useStore.getState().inputFocusKeeperElement?.focus();
              toggleInlineFormatting(editorView, "**");
            }
          }}
        />

        <ToolButton
          tooltip="Make text italic"
          icon={<ItalicIcon />}
          onClick={() => {
            if (activeBlockId && editorView) {
              useStore.getState().inputFocusKeeperElement?.focus();
              toggleInlineFormatting(editorView, "_");
            }
          }}
        />

        <ToolButton
          tooltip="Strikethrough text"
          icon={<StrikethroughIcon />}
          onClick={() => {
            if (activeBlockId && editorView) {
              useStore.getState().inputFocusKeeperElement?.focus();
              toggleInlineFormatting(editorView, "~~");
            }
          }}
        />
        <ToolButton
          tooltip="Insert code block"
          icon={<Code2Icon />}
          onClick={() => {
            if (activeBlockId && editorView) {
              useStore.getState().inputFocusKeeperElement?.focus();
              toggleInlineFormatting(editorView, { open: "```\n", close: "\n```" });
            }
          }}
        ></ToolButton>

        <ToolButton
          tooltip="Add spoiler tag"
          icon={<BadgeAlertIcon />}
          onClick={() => {
            if (activeBlockId && editorView) {
              useStore.getState().inputFocusKeeperElement?.focus();
              toggleInlineFormatting(editorView, "||");
            }
          }}
        />

        <ToolButton
          tooltip="Highlight text"
          icon={<HighlighterIcon />}
          onClick={() => {
            if (activeBlockId && editorView) {
              useStore.getState().inputFocusKeeperElement?.focus();
              toggleInlineFormatting(editorView, "==");
            }
          }}
        />

        <ToolButton
          tooltip="Wrap in brackets"
          icon={<BracketsIcon />}
          onClick={() => {
            if (activeBlockId && editorView) {
              useStore.getState().inputFocusKeeperElement?.focus();
              toggleInlineFormatting(editorView, { open: "[", close: "]" });
            }
          }}
        />

        <ToolButton
          tooltip="Wrap in parentheses"
          icon={<ParenthesesIcon />}
          onClick={() => {
            if (activeBlockId && editorView) {
              useStore.getState().inputFocusKeeperElement?.focus();
              toggleInlineFormatting(editorView, { open: "(", close: ")" });
            }
          }}
        />

        <ToolButton
          tooltip="Wrap in braces"
          icon={<BracesIcon />}
          onClick={() => {
            if (activeBlockId && editorView) {
              useStore.getState().inputFocusKeeperElement?.focus();
              toggleInlineFormatting(editorView, { open: "{", close: "}" });
            }
          }}
        />

        <ToolButton
          tooltip="Insert math formula"
          icon={<SigmaIcon />}
          onClick={() => {
            if (activeBlockId && editorView) {
              useStore.getState().inputFocusKeeperElement?.focus();
              toggleInlineFormatting(editorView, { open: "$$", close: "$$" });
            }
          }}
        />

        <ToolButton
          tooltip="Insert quote"
          icon={<QuoteIcon className="text-warning" />}
          onClick={() => log.warn("Quote action not implemented yet.")}
        />

        <ToolButton
          tooltip="Insert table"
          icon={<TableIcon className="text-warning" />}
          onClick={() => log.warn("Table action not implemented yet.")}
        />

        <ToolButton
          tooltip="Insert calendar event"
          icon={<CalendarDaysIcon className="text-warning" />}
          onClick={() => log.warn("Calendar action not implemented yet.")}
        />

        <ToolButton
          tooltip="Insert Template"
          icon={<FormIcon className="text-warning" />}
          onClick={() => log.warn("Templates action not implemented yet.")}
        />
      </div>
    </div>
  );
}

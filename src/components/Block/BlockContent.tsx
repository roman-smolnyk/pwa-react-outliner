import { getItem } from "esm-treero-api";
import log from "loglevel";
import { useEffect, useMemo, useState } from "react";
import { useContentViewMode } from "../../contexts/PlainTextViewContext";
import { useReadOnly } from "../../contexts/ReadOnlyContext";
import { useTheme } from "../../hooks/theme";
import useZustandStore from "../../store/useZustandStore";
import yjs from "../../store/yjsManager";
import { getCharIndexFromMouse } from "../../utils/utilities";
import CM6LivePreviewEditor from "../Editor/CM6LivePreviewEditor";
import CM6PlainTextEditor from "../Editor/CM6PlainTextEditor";
import Markdown from "../Markdown/Markdown";
import PlainTextContent from "./PlainTextContent";

export default function BlockContent({ id, content }: { id: string; content: string }) {
  // log.debug("BlockContent");
  const [isEdit, setIsEdit] = useState(false);
  const [charIndex, setCharIndex] = useState(0);
  const { readOnly } = useReadOnly();
  const { contentViewMode } = useContentViewMode();
  const { theme, setTheme } = useTheme();
  const isDarkTheme = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  const focusBlockId = useZustandStore((s) => s.focusBlockId);
  const caretCharIndex = useZustandStore((s) => s.caretCharIndex);

  useEffect(() => {
    if (focusBlockId === id) {
      setIsEdit(true);
      setCharIndex(caretCharIndex);
      useZustandStore.setState({ focusBlockId: null, caretCharIndex: 0 });
    }
  }, [focusBlockId, id]);

  // const yblock = useMemo(() => getItem(yjs.yblocks, id), [id]);
  // const content = yblock.get("content").toString();

  // log.debug("BlockContent", id, { isEdit });

  return (
    <div className={`BlockContent w-full ${isEdit ? "bg-muted" : ""}`}>
      {!isEdit ? (
        <div
          className={`BlockContent-render block-content min-h-[1em] ${readOnly ? "cursor-default" : "cursor-text select-none"}`}
          // onClick={(e) => {
          //   if (readOnly) return;
          //   setCharIndex(getCharIndexFromMouse(e.currentTarget, e.clientX, e.clientY));
          //   setIsEdit(true);
          // }}
          onPointerDown={(e) => {
            // log.debug("onPointerDown");
            if (readOnly) return;
            if (e.pointerType !== "touch") {
              e.preventDefault();
              e.stopPropagation();
              setCharIndex(getCharIndexFromMouse(e.currentTarget, e.clientX, e.clientY));
              setIsEdit(true);
            }
          }}
          onPointerUp={(e) => {
            if (readOnly) return;
            if (e.pointerType === "touch") {
              e.preventDefault();
              e.stopPropagation();
              setCharIndex(getCharIndexFromMouse(e.currentTarget, e.clientX, e.clientY));
              setIsEdit(true);
            }
          }}
        >
          {contentViewMode === "source" ? (
            <PlainTextContent>{content ?? " "}</PlainTextContent>
          ) : (
            <Markdown isDarkTheme={isDarkTheme}>{content}</Markdown>
          )}
        </div>
      ) : (
        <div className="BlockContent-edit">
          {["source", "markdown"].includes(contentViewMode) ? (
            <CM6PlainTextEditor id={id} charIndex={charIndex} setIsEdit={setIsEdit} />
          ) : (
            <CM6LivePreviewEditor id={id} charIndex={charIndex} setIsEdit={setIsEdit} />
          )}
        </div>
      )}
    </div>
  );
}

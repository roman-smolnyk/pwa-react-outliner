import log from "loglevel";
import { memo } from "react";
import { useContentViewMode } from "../../contexts/PlainTextViewContext";
import { useReadOnly } from "../../contexts/ReadOnlyContext";
import useStore from "../../store/useStore";
import { getCharIndexFromMouse } from "../../utils/utilities";
import CM6Editor from "../Editor/CM6Editor";
import Markdown from "../Markdown/Markdown";
import PlainTextContent from "./PlainTextContent";

const BlockContentInner = memo(function BlockContentInner({ id, content, isEdit }: { id: string; content: string; isEdit: boolean }) {
  // log.debug("BlockContentInner");

  const { readOnly } = useReadOnly();
  const { contentViewMode } = useContentViewMode();
  // const isTouchscreen = useMediaQuery('(pointer: coarse)');

  const { caretCharIndex } = useStore.getState();

  return (
    <div className={`BlockContent w-full min-h-[calc((1rem*var(--leading-snug))+4px)] ${isEdit ? "bg-muted" : ""}`}>
      {!isEdit ? (
        <div
          className={`BlockContent-render block-content ${readOnly ? "cursor-default" : "cursor-text select-none"}`}
          onPointerDown={(e) => {
            log.debug("BlockContentInner:onPointerDown");
            if (readOnly) return;
            useStore.setState({ caretCharIndex: getCharIndexFromMouse(e.currentTarget, e.clientX, e.clientY) });
          }}
          onClick={(e) => {
            log.debug("BlockContentInner:onClick");
            if (readOnly) return;
            useStore.setState({ activeBlockId: id });
          }}
        >
          {contentViewMode === "source" ? <PlainTextContent>{content ?? " "}</PlainTextContent> : <Markdown>{content ?? " "}</Markdown>}
        </div>
      ) : (
        <div className="BlockContent-edit" data-id={id}>
          {["source", "markdown"].includes(contentViewMode) ? (
            <CM6Editor id={id} charIndex={caretCharIndex} />
          ) : (
            <CM6Editor id={id} charIndex={caretCharIndex} livePreview />
          )}
        </div>
      )}
    </div>
  );
});
BlockContentInner.displayName = "BlockContentInner";

export default function BlockContent({ id, content }: { id: string; content: string }) {
  // log.debug("BlockContent");

  const activeBlockId = useStore((s) => s.activeBlockId);

  return <BlockContentInner id={id} content={content} isEdit={activeBlockId === id} />;
}

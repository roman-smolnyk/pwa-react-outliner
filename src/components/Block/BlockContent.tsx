import { getBlock } from "esm-treero-api";
import { usePlainTextView } from "../../contexts/PlainTextViewContext";

import PlainTextContent from "./PlainTextContent";
import yjs from "../../store/yjsManager";
import Markdown from "../Markdown/Markdown";
import { useState } from "react";
import CodeMirrorEditor from "./CodeMirrorEditor";
import { getCharIndexFromMouse } from "../../etc/utilities";
import { useReadOnly } from "../../contexts/ReadOnlyContext";

export default function BlockContent({ id }: { id: string }) {
  const [isEdit, setIsEdit] = useState(false);
  const [charIndex, setCharIndex] = useState(-1);
  const { readOnly } = useReadOnly();
  const { plainTextView } = usePlainTextView();

  const yblock = getBlock(yjs.ydoc, id);
  const content = yblock.get("content").toString();

  return (
    <div className="BlockContent w-full">
      {!isEdit ? (
        <div
          className={`BlockContent-render wrap-break-word min-h-5 ${readOnly ? "cursor-default" : "cursor-text"}`}
          style={{ padding: "0px 6px 0px 6px" }}
          onPointerDown={(e) => {
            console.debug("onPointerDown");
            e.preventDefault();
            e.stopPropagation();
            if (readOnly) return;
            if (e.pointerType !== "touch") {
            }
            setCharIndex(getCharIndexFromMouse(e.currentTarget, e.clientX, e.clientY));
            setIsEdit(true);
          }}
          onPointerUp={(e) => {
            if (readOnly) return;
            if (e.pointerType === "touch") {
            }
            // setCharIndex(getCharIndexFromMouse(e.currentTarget, e.clientX, e.clientY));
            // setIsEdit(true);
          }}
        >
          {plainTextView ? <PlainTextContent>{content}</PlainTextContent> : <Markdown>{content}</Markdown>}
        </div>
      ) : (
        <div className="BlockContent-edit">
          <CodeMirrorEditor id={id} charIndex={charIndex} setIsEdit={setIsEdit} />
        </div>
      )}
    </div>
  );
}

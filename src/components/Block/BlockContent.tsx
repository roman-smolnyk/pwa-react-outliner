import { getItem } from "esm-treero-api";
import { useEffect, useMemo, useState } from "react";
import { usePlainTextView } from "../../contexts/PlainTextViewContext";
import { useReadOnly } from "../../contexts/ReadOnlyContext";
import useZustandStore from "../../store/useZustandStore";
import yjs from "../../store/yjsManager";
import { getCharIndexFromMouse } from "../../utils/utilities";
import Markdown from "../Markdown/Markdown";
import CodeMirrorEditor from "./CodeMirrorEditor";
import PlainTextContent from "./PlainTextContent";

export default function BlockContent({ id }: { id: string }) {
  // console.debug("BlockContent");
  const [isEdit, setIsEdit] = useState(false);
  const [charIndex, setCharIndex] = useState(-1);
  const { readOnly } = useReadOnly();
  const { plainTextView } = usePlainTextView();

  const selectedBlockId = useZustandStore((s) => s.selectedBlockId);
  const caretCharIndex = useZustandStore((s) => s.caretCharIndex);

  useEffect(() => {
    if (selectedBlockId === id) {
      setIsEdit(true);
      setCharIndex(caretCharIndex);
      useZustandStore.setState({ selectedBlockId: null }); // consume the signal
      useZustandStore.setState({ caretCharIndex: 0 });
    }
  }, [selectedBlockId, id]);

  const yblock = useMemo(() => getItem(yjs.yblocks, id), [id]);
  const content = yblock.get("content").toString();

  return (
    <div className={`BlockContent w-full ${isEdit ? "bg-gray-100" : ""}`}>
      {!isEdit ? (
        <div
          className={`BlockContent-render wrap-break-word min-h-5 ${readOnly ? "cursor-default" : "cursor-text"}`}
          style={{ padding: "0px 6px 0px 6px" }}
          onPointerDown={(e) => {
            // console.debug("onPointerDown");
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

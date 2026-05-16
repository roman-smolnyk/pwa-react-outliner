import { EditorSelection, EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { getItem } from "esm-treero-api";
import { memo, useEffect, useMemo, useRef } from "react";
import yjs from "../../store/yjsManager";
import { createDomEventHandlers, createShortcutsKeymap, createUpdateListener, createYtextObserver, resolveIndex, sharedTheme } from "./CM6Common";

const CM6PlainTextEditor = memo(({ id, charIndex, setIsEdit }: { id: string; charIndex: number; setIsEdit: CallableFunction }) => {
  console.debug("CM6PlainTextEditor", id, charIndex);
  const editorRef = useRef<HTMLDivElement>(null);
  const yblock = useMemo(() => getItem(yjs.yblocks, id), [id]);

  useEffect(() => {
    const ytext = yblock.get("content");

    const state = EditorState.create({
      doc: ytext.toString(),
      extensions: [
        sharedTheme,
        createDomEventHandlers(id, setIsEdit),
        createShortcutsKeymap(id, ytext),
        createUpdateListener(ytext),
        EditorView.lineWrapping,
      ],
    });

    const view = new EditorView({ state, parent: editorRef.current! });

    view.focus();
    view.dispatch({
      selection: EditorSelection.cursor(resolveIndex(charIndex, view.state.doc.length)),
      scrollIntoView: true,
    });
    setTimeout(() => view.dispatch({ scrollIntoView: true }), 200);

    const ytextObserver = createYtextObserver(view, ytext);
    ytext.observe(ytextObserver);

    return () => {
      view.destroy();
      ytext.unobserve(ytextObserver);
    };
  }, []);

  return <div ref={editorRef} />;
});

export default CM6PlainTextEditor;

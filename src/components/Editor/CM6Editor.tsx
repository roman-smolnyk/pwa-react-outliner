// src/components/Editor/CM6Editor.tsx
import { markdown } from "@codemirror/lang-markdown";
import { EditorSelection, EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { getItem } from "esm-treero-api";
import log from "loglevel";
import { memo, useEffect, useMemo, useRef } from "react";
import useStore from "../../store/useStore";
import yjs from "../../store/yjsManager";
import { createDomEventHandlers, createShortcutsKeymap, createUpdateListener, createYtextObserver, resolveIndex, sharedTheme } from "./CM6Common";
import { livePreviewPlugin, markdownTheme } from "./CM6LivePreview";

const CM6Editor = memo(
  ({ id, charIndex, setIsEdit, livePreview = false }: { id: string; charIndex: number; setIsEdit: (v: boolean) => void; livePreview?: boolean }) => {
    log.debug("CM6Editor", id, charIndex, { livePreview });

    const ref = useRef<HTMLDivElement>(null);
    const isDestroyingRef = useRef(false);
    const yblock = useMemo(() => getItem(yjs.yblocks, id), [id]);

    useEffect(() => {
      log.debug("CM6Editor:useEffect");
      isDestroyingRef.current = false;
      if (!ref.current) return;

      function onBlur() {
        log.debug("onBlur isDestroyingRef.current", isDestroyingRef.current);
        if (!isDestroyingRef.current) {
          setIsEdit(false);
        }
      }

      const ytext = yblock.get("content");

      const modeExtensions = livePreview ? [markdown(), livePreviewPlugin, markdownTheme] : [];

      const state = EditorState.create({
        doc: ytext.toString(),
        extensions: [
          sharedTheme,
          createDomEventHandlers(id, onBlur),
          createShortcutsKeymap(id, ytext),
          createUpdateListener(ytext),
          EditorView.lineWrapping,
          EditorView.contentAttributes.of({ spellcheck: "true" }),
          ...modeExtensions,
        ],
      });

      const view = new EditorView({ state, parent: ref.current });

      useStore.setState({ selectedBlockId: id, editorView: view });

      view.focus();
      view.dispatch({
        selection: EditorSelection.cursor(resolveIndex(charIndex, view.state.doc.length)),
        scrollIntoView: true,
      });
      setTimeout(() => view.dispatch({ scrollIntoView: true }), 200);

      const ytextObserver = createYtextObserver(view, ytext);
      ytext.observe(ytextObserver);

      return () => {
        log.debug("CM6Editor:useEffect:unmount", id);
        isDestroyingRef.current = true;
        if (useStore.getState().selectedBlockId === id) {
          useStore.setState({ selectedBlockId: null, editorView: null });
        }
        view.destroy();
        ytext.unobserve(ytextObserver);
      };
    }, []);

    return <div ref={ref} className="CM6Editor" />;
  },
);
CM6Editor.displayName = "CM6Editor";

export default CM6Editor;

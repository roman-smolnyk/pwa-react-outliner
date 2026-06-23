// src/components/Editor/CM6Editor.tsx
import { markdown } from "@codemirror/lang-markdown";
import { EditorSelection, EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { getItem } from "esm-treero-api";
import log from "loglevel";
import { memo, useEffect, useMemo, useRef, type RefObject } from "react";
import { useOnClickOutside } from "usehooks-ts";
import useStore from "../../store/useStore";
import yjs from "../../store/yjsManager";
import { createDomEventHandlers, createUpdateListener, createYtextObserver, resolveIndex, sharedTheme } from "./CM6Common";
import { createHotkeysKeymap } from "./CM6Hotkeys";
import { livePreviewPlugin, markdownTheme } from "./CM6LivePreview";

const CM6Editor = memo(function CM6Editor({ id, charIndex, livePreview = false }: { id: string; charIndex: number; livePreview?: boolean }) {
  log.debug("CM6Editor", { id, charIndex, livePreview });
  const ref = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLElement>(null);
  const isDestroyingRef = useRef(false);

  const yblock = useMemo(() => getItem(yjs.yblocks, id), [id]);

  const footerElement = useStore((s) => s.footerElement);
  footerRef.current = footerElement;

  useOnClickOutside(
    [ref as RefObject<HTMLElement>, footerRef as RefObject<HTMLElement>],
    (e) => {
      const target = e.target as HTMLElement;
      if (!isDestroyingRef.current && target.dataset?.id !== id) {
        useStore.setState({ activeBlockId: null });
      }
    },
    "mouseup",
  );

  useEffect(() => {
    // log.debug("CM6Editor:useEffect");
    isDestroyingRef.current = false;
    if (!ref.current) return;

    const ytext = yblock.get("content");

    const modeExtensions = livePreview ? [markdown(), livePreviewPlugin, markdownTheme] : [];

    const state = EditorState.create({
      doc: ytext.toString(),
      extensions: [
        sharedTheme,
        createDomEventHandlers(id, isDestroyingRef),
        createHotkeysKeymap(id, ytext),
        createUpdateListener(ytext),
        EditorView.lineWrapping,
        EditorView.contentAttributes.of({ spellcheck: "true" }),
        ...modeExtensions,
      ],
    });

    const view = new EditorView({ state, parent: ref.current });

    useStore.setState({ editorView: view });
    log.debug("CM6Editor:useEffect:mount", id);

    view.focus();
    view.dispatch({
      selection: EditorSelection.cursor(resolveIndex(charIndex, view.state.doc.length)),
      scrollIntoView: true,
    });
    setTimeout(() => view.dispatch({ scrollIntoView: true }), 200);

    const ytextObserver = createYtextObserver(view, ytext);
    ytext.observe(ytextObserver);

    return () => {
      log.debug("CM6Editor:useEffect:unmount", id, useStore.getState().activeBlockId);
      isDestroyingRef.current = true;
      if (useStore.getState().activeBlockId === id) {
        useStore.setState({ editorView: null });
      }
      view.destroy();
      ytext.unobserve(ytextObserver);
    };
  }, []);

  return <div ref={ref} className="CM6Editor" />;
});
CM6Editor.displayName = "CM6Editor";

export default CM6Editor;

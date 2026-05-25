import { markdown } from "@codemirror/lang-markdown";
import { syntaxTree } from "@codemirror/language";
import { EditorSelection, EditorState, RangeSetBuilder } from "@codemirror/state";
import { Decoration, EditorView, ViewPlugin, ViewUpdate, type DecorationSet } from "@codemirror/view";
import { getItem } from "esm-treero-api";
import log from "loglevel";
import { memo, useEffect, useMemo, useRef } from "react";
import useZustandStore from "../../store/useZustandStore";
import yjs from "../../store/yjsManager";
import { createDomEventHandlers, createShortcutsKeymap, createUpdateListener, createYtextObserver, resolveIndex, sharedTheme } from "./CM6Common";

function cursorIn(state: EditorState, from: number, to: number) {
  for (const r of state.selection.ranges) {
    if (r.from <= to && r.to >= from) return true;
  }
  return false;
}

function buildDecos(view: EditorView) {
  const { state } = view;
  const items: [number, number, Decoration][] = [];

  syntaxTree(state).iterate({
    enter(node) {
      const { from, to, name } = node;

      if (name === "StrongEmphasis") {
        const near = cursorIn(state, from, to);
        if (!near) {
          items.push([from, from + 2, Decoration.replace({})]);
          items.push([to - 2, to, Decoration.replace({})]);
        }
        items.push([near ? from : from + 2, near ? to : to - 2, Decoration.mark({ class: "md-bold" })]);
      }

      if (name === "Emphasis") {
        const near = cursorIn(state, from, to);
        if (!near) {
          items.push([from, from + 1, Decoration.replace({})]);
          items.push([to - 1, to, Decoration.replace({})]);
        }
        items.push([near ? from : from + 1, near ? to : to - 1, Decoration.mark({ class: "md-italic" })]);
      }

      if (name === "InlineCode") {
        const near = cursorIn(state, from, to);
        if (!near) {
          items.push([from, from + 1, Decoration.replace({})]);
          items.push([to - 1, to, Decoration.replace({})]);
        }
        items.push([near ? from : from + 1, near ? to : to - 1, Decoration.mark({ class: "md-code" })]);
      }

      if (/^ATXHeading[1-6]$/.test(name)) {
        const level = parseInt(name.slice(-1), 10);
        const line = state.doc.lineAt(from);
        const near = cursorIn(state, line.from, line.to);
        if (!near) {
          items.push([from, from + level + 1, Decoration.replace({})]);
        }
        items.push([near ? from : from + level + 1, to, Decoration.mark({ class: `md-h md-h${level}` })]);
      }
    },
  });

  items.sort((a, b) => a[0] - b[0] || a[1] - b[1]);

  const builder = new RangeSetBuilder<Decoration>();
  for (const [from, to, deco] of items) {
    builder.add(from, to, deco);
  }
  return builder.finish();
}

const livePreviewPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;
    constructor(view: EditorView) {
      this.decorations = buildDecos(view);
    }
    update(update: ViewUpdate) {
      if (update.docChanged || update.selectionSet || update.viewportChanged) {
        this.decorations = buildDecos(update.view);
      }
    }
  },
  { decorations: (v) => v.decorations },
);

const markdownTheme = EditorView.theme({
  // ".md-bold": { fontWeight: "700" },
  // ".md-italic": { fontStyle: "italic" },
  // ".md-code": {
  //   fontFamily: "monospace",
  //   fontSize: "0.88em",
  //   backgroundColor: "#e5e7eb",
  //   borderRadius: "3px",
  //   padding: "1px 4px",
  // },
  // ".md-h": { fontWeight: "700", lineHeight: "1.3" },
  // ".md-h1": { fontSize: "1.875em" },
  // ".md-h2": { fontSize: "1.5em" },
  // ".md-h3": { fontSize: "1.25em" },
  // ".md-h4": { fontSize: "1.125em" },
  // ".md-h5": { fontSize: "1em" },
  // ".md-h6": { fontSize: "0.9em", color: "#6b7280" },
});

// ─── component ───────────────────────────────────────────────────────────────

const CM6LivePreviewEditor = memo(({ id, charIndex, setIsEdit }: { id: string; charIndex: number; setIsEdit: (v: boolean) => void }) => {
  log.debug("CM6LivePreviewEditor", id, charIndex);
  const ref = useRef<HTMLDivElement>(null);
  const isDestroyingRef = useRef(false);
  const yblock = useMemo(() => getItem(yjs.yblocks, id), [id]);

  useEffect(() => {
    log.debug("CM6LivePreviewEditor:useEffect");
    isDestroyingRef.current = false;
    if (!ref.current) return;

    function onBlur() {
      log.debug("onBlur isDestroyingRef.current", isDestroyingRef.current);
      if (!isDestroyingRef.current) {
        setIsEdit(false);
      }
    }
    const ytext = yblock.get("content");

    const state = EditorState.create({
      doc: ytext.toString(),
      extensions: [
        sharedTheme,
        createDomEventHandlers(id, onBlur),
        createShortcutsKeymap(id, ytext),
        createUpdateListener(ytext),
        EditorView.lineWrapping,
        markdown(),
        livePreviewPlugin,
        markdownTheme,
      ],
    });

    const view = new EditorView({ state, parent: ref.current });

    useZustandStore.setState({ selectedBlockId: id, editorView: view });

    view.focus();
    view.dispatch({
      selection: EditorSelection.cursor(resolveIndex(charIndex, view.state.doc.length)),
      scrollIntoView: true,
    });
    setTimeout(() => view.dispatch({ scrollIntoView: true }), 200);

    const ytextObserver = createYtextObserver(view, ytext);
    ytext.observe(ytextObserver);

    return () => {
      log.debug("CM6LivePreviewEditor:useEffect:unmount", id);
      isDestroyingRef.current = true;
      if (useZustandStore.getState().selectedBlockId === id) {
        useZustandStore.setState({ selectedBlockId: null, editorView: null });
      }
      view.destroy();
      ytext.unobserve(ytextObserver);
    };
  }, []);

  return <div ref={ref} />;
});

export default CM6LivePreviewEditor;

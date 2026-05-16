import { defaultKeymap } from "@codemirror/commands";
import { markdown } from "@codemirror/lang-markdown";
import { syntaxTree } from "@codemirror/language";
import { Annotation, EditorSelection, EditorState, RangeSetBuilder } from "@codemirror/state";
import { Decoration, EditorView, ViewPlugin, ViewUpdate, keymap, type DecorationSet } from "@codemirror/view";
import { getItem } from "esm-treero-api";
import { memo, useEffect, useMemo, useRef } from "react";
import type { YTextEvent, Transaction as YTransaction } from "yjs";
import {
  handleBlockAdd,
  handleBlockDelete,
  handleBlockIndent,
  handleBlockMoveDown,
  handleBlockMoveUp,
  handleBlockOutdent,
  handleBlockSelectDown,
  handleBlockSelectUp,
} from "../../api/api";
import useZustandStore from "../../store/useZustandStore";
import yjs from "../../store/yjsManager";

// ─── helpers ─────────────────────────────────────────────────────────────────

function cursorIn(state: EditorState, from: number, to: number) {
  for (const r of state.selection.ranges) {
    if (r.from <= to && r.to >= from) return true;
  }
  return false;
}

function resolveIndex(index: number, docLength: number): number {
  if (index < 0) return Math.max(0, docLength + index + 1);
  return Math.min(index, docLength);
}

// ─── live-preview decorations ────────────────────────────────────────────────

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

// ─── theme ───────────────────────────────────────────────────────────────────
// Matches CM6PlainTextEditor's font/sizing; markdown classes layered on top.

const theme = EditorView.theme({
  "&.cm-focused": { outline: "none" },
  ".cm-content": {
    fontFamily: "Roboto, Inter, Arial, system-ui, Avenir, Helvetica, sans-serif",
    fontSize: "16px",
    lineHeight: "1.5",
    padding: "4px 6px",
  },
  ".cm-line": { padding: "0" },

  // ── markdown rendering
  ".md-bold": { fontWeight: "700" },
  ".md-italic": { fontStyle: "italic" },
  ".md-code": {
    fontFamily: "monospace",
    fontSize: "0.88em",
    backgroundColor: "#e5e7eb", // tailwind gray-200
    borderRadius: "3px",
    padding: "1px 4px",
  },
  ".md-h": { fontWeight: "700", lineHeight: "1.3" },
  ".md-h1": { fontSize: "1.875em" }, // ~tailwind text-3xl
  ".md-h2": { fontSize: "1.5em" },
  ".md-h3": { fontSize: "1.25em" },
  ".md-h4": { fontSize: "1.125em" },
  ".md-h5": { fontSize: "1em" },
  ".md-h6": { fontSize: "0.9em", color: "#6b7280" },
});

// ─── component ───────────────────────────────────────────────────────────────

const CM6LivePreviewEditor = memo(({ id, charIndex, setIsEdit }: { id: string; charIndex: number; setIsEdit: CallableFunction }) => {
  console.debug("CM6LivePreviewEditor", id, charIndex);
  const editorRef = useRef<HTMLDivElement>(null);
  const yblock = useMemo(() => getItem(yjs.yblocks, id), [id]);

  useEffect(() => {
    console.debug("CM6LivePreviewEditor:useEffect");
    const ytext = yblock.get("content");

    // ── annotation to skip ytext re-sync on undo/redo dispatches
    const CustomAnnotation = Annotation.define<string>();

    // ── blur / focus
    const domEventHandlers = EditorView.domEventHandlers({
      blur: (event: FocusEvent, view: EditorView) => {
        const relatedTarget = event.relatedTarget as HTMLElement | null;
        console.debug("CM6LivePreviewEditor:blur", relatedTarget);

        if (!document.hasFocus()) return;

        if (relatedTarget instanceof HTMLElement && relatedTarget.dataset.ignoreBlur === "true") {
          event.preventDefault();
          if (relatedTarget.classList.contains("AddBlock")) {
            setTimeout(() => setIsEdit(false), 200);
          } else if (relatedTarget.classList.contains("MoveBlockDown")) {
            requestAnimationFrame(() => {
              view.focus();
              view.dispatch({
                selection: EditorSelection.cursor(view.state.selection.main.head),
                scrollIntoView: true,
              });
            });
          } else {
            requestAnimationFrame(() => {
              view.focus();
              view.dispatch({
                selection: EditorSelection.cursor(view.state.selection.main.head),
                scrollIntoView: true,
              });
            });
          }
          return;
        }

        if (useZustandStore.getState().selectedBlockId === id) {
          useZustandStore.setState({ selectedBlockId: null });
        }
        setIsEdit(false);
      },
      focus: (_event: FocusEvent, _view: EditorView) => {
        console.debug("CM6LivePreviewEditor:focus");
        useZustandStore.setState({ selectedBlockId: id });
      },
    });

    // ── keymaps (identical to CM6PlainTextEditor)
    const shortcutsKeymap = keymap.of([
      {
        key: "Mod-z",
        run: (view: EditorView) => {
          yjs.undoManager?.undo();
          const text = ytext.toString();
          if (view.state.doc.toString() !== text) {
            view.dispatch({
              changes: { from: 0, to: view.state.doc.length, insert: text },
              selection: EditorSelection.cursor(Math.min(text.length, view.state.selection.main.head)),
              annotations: CustomAnnotation.of("customundoredo"),
            });
          }
          useZustandStore.getState().renderPage();
          return true;
        },
      },
      {
        key: "Mod-Shift-z",
        run: (view: EditorView) => {
          yjs.undoManager?.redo();
          const text = ytext.toString();
          if (view.state.doc.toString() !== text) {
            view.dispatch({
              changes: { from: 0, to: view.state.doc.length, insert: text },
              annotations: CustomAnnotation.of("customundoredo"),
            });
            try {
              view.dispatch({
                selection: EditorSelection.cursor(Math.max(text.length, view.state.selection.main.head)),
                annotations: CustomAnnotation.of("customundoredo"),
              });
            } catch {}
          }
          useZustandStore.getState().renderPage();
          return true;
        },
      },
      {
        key: "ArrowUp",
        run: (view: EditorView) => {
          if (view.state.selection.main.head === 0) {
            handleBlockSelectUp(id);
            return true;
          }
          useZustandStore.getState().renderPage();
          return false;
        },
      },
      {
        key: "ArrowDown",
        run: (view: EditorView) => {
          if (view.state.selection.main.head === view.state.doc.length) {
            handleBlockSelectDown(id);
            return true;
          }
          useZustandStore.getState().renderPage();
          return false;
        },
      },
      {
        key: "Mod-Enter",
        run: () => {
          handleBlockAdd(id);
          useZustandStore.getState().renderPage();
          return true;
        },
      },
      {
        key: "Backspace",
        run: (view: EditorView) => {
          if (view.state.doc.length === 0) {
            handleBlockDelete(id);
            useZustandStore.getState().renderPage();
            return true;
          }
          return false;
        },
      },
      {
        key: "Mod-Backspace",
        run: () => {
          handleBlockDelete(id);
          useZustandStore.getState().renderPage();
          return true;
        },
      },
      {
        key: "Mod-Delete",
        run: () => {
          handleBlockDelete(id);
          useZustandStore.getState().renderPage();
          return true;
        },
      },
      {
        key: "Mod-ArrowRight",
        run: () => {
          handleBlockIndent(id);
          useZustandStore.getState().renderPage();
          return true;
        },
      },
      {
        key: "Mod-ArrowLeft",
        run: () => {
          handleBlockOutdent(id);
          useZustandStore.getState().renderPage();
          return true;
        },
      },
      {
        key: "Mod-ArrowUp",
        run: () => {
          handleBlockMoveUp(id);
          useZustandStore.getState().renderPage();
          return true;
        },
      },
      {
        key: "Mod-ArrowDown",
        run: () => {
          handleBlockMoveDown(id);
          useZustandStore.getState().renderPage();
          return true;
        },
      },
      ...defaultKeymap,
    ]);

    // ── ytext ↔ CM6 sync (local edits → ytext)
    const updateListener = EditorView.updateListener.of((update) => {
      if (!update.docChanged) return;
      const tr = update.transactions[0];
      if (tr.annotation(CustomAnnotation) === "customundoredo") return;

      update.changes.iterChanges((fromA, toA, _fromB, _toB, inserted) => {
        const insertedText = inserted.toString();
        const deletedLength = toA - fromA;
        if (deletedLength > 0) ytext.delete(fromA, deletedLength);
        if (insertedText.length > 0) ytext.insert(fromA, insertedText);
      });
    });

    // ── create editor
    const state = EditorState.create({
      doc: ytext.toString(),
      extensions: [theme, markdown(), livePreviewPlugin, shortcutsKeymap, domEventHandlers, updateListener, EditorView.lineWrapping],
    });

    const view = new EditorView({ state, parent: editorRef.current! });

    // focus + place cursor
    view.focus();
    view.dispatch({
      selection: EditorSelection.cursor(resolveIndex(charIndex, view.state.doc.length)),
      scrollIntoView: true,
    });
    setTimeout(() => view.dispatch({ scrollIntoView: true }), 200);

    // ── remote yjs changes → CM6
    function ytextObserver(event: YTextEvent, transaction: YTransaction) {
      if (!transaction.origin) return;
      console.info("CM6LivePreviewEditor:ytext.observe", event, transaction);
      const text = ytext.toString();
      if (view.state.doc.toString() === text) return;

      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: text },
        annotations: CustomAnnotation.of("customundoredo"),
      });
      try {
        view.dispatch({
          selection: EditorSelection.cursor(Math.max(text.length, view.state.selection.main.head)),
          annotations: CustomAnnotation.of("customundoredo"),
        });
      } catch {}
    }

    // @ts-ignore
    ytext.observe(ytextObserver);

    return () => {
      view.destroy();
      // @ts-ignore
      ytext.unobserve(ytextObserver);
    };
  }, []);

  return <div ref={editorRef} />;
});

export default CM6LivePreviewEditor;

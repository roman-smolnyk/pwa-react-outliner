import { defaultKeymap } from "@codemirror/commands";
import { EditorSelection, EditorState } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { getItem, isRootItem, updateBlock } from "esm-treero-api";
import { memo, useEffect, useMemo, useRef } from "react";
import { yCollab } from "y-codemirror.next";
import {
  handleBlockAdd,
  handleBlockDelete,
  handleBlockIndent,
  handleBlockMoveDown,
  handleBlockMoveUp,
  handleBlockOutdent,
  handleSelectBlockDown,
  handleSelectBlockUp,
} from "../../api/api";
import yjs from "../../store/yjsManager";
import useZustandStore from "../../store/useZustandStore";

// const CodeMirrorEditor = memo(({ id, charIndex, setIsEdit }: { id: string; charIndex: number; setIsEdit: CallableFunction }) => {
export default function CodeMirrorEditor({ id, charIndex, setIsEdit }: { id: string; charIndex: number; setIsEdit: CallableFunction }) {
  console.debug("CodeMirrorEditor", id, charIndex, setIsEdit);
  const editorRef = useRef<HTMLDivElement>(null);
  // const viewRef = useRef<EditorView | null>(null);

  const yblock = useMemo(() => getItem(yjs.yblocks, id), [id]);

  useEffect(() => {
    console.debug("CodeMirrorEditor:useEffect");
    // if (viewRef.current) return;

    const ytext = yblock.get("content");

    const theme = EditorView.theme({
      "&": {
        //   fontFamily: "Roboto, Inter, Arial, system-ui, Avenir, Helvetica, sans-serif",
        //   fontSize: "16px",
        //   lineHeight: "1.25",
        // padding: "0px 6px 0px 6px",
      },
      "&.cm-focused": {
        // This removes the browser's default focus ring
        outline: "none",
      },
      // ".cm-editor": {
      //   "min-height": "100px",
      //   // padding: "0px 6px 0px 6px",
      // },
      ".cm-content": {
        // This targets the actual text area
        // fontFamily: "Roboto, Inter, Arial, system-ui, Avenir, Helvetica, sans-serif",
        // fontSize: "16px",
        // lineHeight: "16px",
        fontFamily: "Roboto, Inter, Arial, system-ui, Avenir, Helvetica, sans-serif",
        fontSize: "16px",
        lineHeight: "1.25",
        // padding: "0px",
        padding: "0px 6px 0px 6px",
      },
      ".cm-line": {
        padding: "0px",
        // padding: "0px 6px 0px 6px",
      },
      // ".cm-gutters": {
      //   // If you kept the line numbers, style them here too
      //   fontFamily: "inherit",
      // },
    });

    const domEventHandlers = EditorView.domEventHandlers({
      blur: (event: FocusEvent, view: EditorView) => {
        console.debug("Editor lost focus", view.state.doc.length);
        if (view.state.doc.length === 0) {
          if (isRootItem(yjs.yblocks, id)) {
            console.debug("updateBlock");
            updateBlock(yjs.ydoc, id, { content: "Untitled" });
          }
        }
        useZustandStore.setState({ selectedBlockId: null });
        setIsEdit(false);
      },
      focus: (event: FocusEvent, view: EditorView) => {
        useZustandStore.setState({ selectedBlockId: id });
        // console.debug("Editor gained focus");
      },
    });

    const state = EditorState.create({
      doc: ytext.toString(),
      extensions: [
        // basicSetup,
        theme,
        // history(), // Needed for undo/redo to work correctly with Yjs
        keymap.of([
          // {
          //   key: "Mod-Z",
          //   run: (view: EditorView) => {
          //     console.debug("Undo");
          //     yjs.undoManager?.undo();
          //     return true;
          //   },
          // },
          {
            key: "ArrowUp",
            run: (view: EditorView) => {
              if (view.state.selection.main.head === 0) {
                handleSelectBlockUp(id);
                return true;
              }

              return false;
            },
          },
          {
            key: "ArrowDown",
            run: (view: EditorView) => {
              if (view.state.selection.main.head === view.state.doc.length) {
                handleSelectBlockDown(id);
                return true;
              }

              return false;
            },
          },
          {
            key: "Mod-Enter",
            run: (view: EditorView) => {
              handleBlockAdd(id);
              return true;
            },
          },
          {
            key: "Backspace",
            run: (view: EditorView) => {
              if (view.state.doc.length === 0) {
                handleBlockDelete(id);
                return true;
              }
              return false;
            },
          },
          {
            key: "Mod-Backspace",
            run: (view: EditorView) => {
              handleBlockDelete(id);
              return true;
            },
          },
          {
            key: "Mod-Delete",
            run: (view: EditorView) => {
              handleBlockDelete(id);
              return true;
            },
          },
          {
            key: "Mod-ArrowRight",
            run: (view: EditorView) => {
              handleBlockIndent(id);
              return true;
            },
          },
          {
            key: "Mod-ArrowLeft",
            run: (view: EditorView) => {
              handleBlockOutdent(id);
              return true;
            },
          },
          {
            key: "Mod-ArrowUp",
            run: (view: EditorView) => {
              handleBlockMoveUp(id);
              return true;
            },
          },
          {
            key: "Mod-ArrowDown",
            run: (view: EditorView) => {
              handleBlockMoveDown(id);
              return true;
            },
          },
          ...defaultKeymap,
        ]),
        domEventHandlers,
        EditorView.lineWrapping,
        // @ts-ignore
        yCollab(ytext, null, { undoManager: yjs.undoManager! }),
      ],
    });

    const view = new EditorView({
      state,
      parent: editorRef.current!,
    });
    // viewRef.current = view;

    function resolveIndex(index: number, docLength: number): number {
      if (index < 0) {
        return Math.max(0, docLength + index + 1);
      }
      return Math.min(index, docLength);
    }

    view.focus();
    view.dispatch({
      selection: EditorSelection.cursor(resolveIndex(charIndex, view.state.doc.length)),
      scrollIntoView: true,
    });

    return () => {
      view.destroy();
      // viewRef.current = null;
    };
  }, []);

  return <div ref={editorRef} />;
}
// export default CodeMirrorEditor;

import { EditorState, EditorSelection } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { createInsertBlockAfter, deleteBlock, getItem, getItemParent, getItemSibling, isRootItem, updateBlock } from "esm-treero-api";
import { useEffect, useMemo, useRef } from "react";
import { yCollab } from "y-codemirror.next";
import yjs from "../../store/yjsManager";
import { defaultKeymap, history } from "@codemirror/commands";
import useZustandStore from "../../store/useZustandStore";
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

export default function CodeMirrorEditor({ id, charIndex, setIsEdit }: { id: string; charIndex: number; setIsEdit: CallableFunction }) {
  const editorRef = useRef(null);

  const yblock = useMemo(() => getItem(yjs.yblocks, id), [id]);

  useEffect(() => {
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
        setIsEdit(false);
      },
      focus: (event: FocusEvent, view: EditorView) => {
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
            key: "Ctrl-Enter",
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
            key: "Ctrl-Backspace",
            run: (view: EditorView) => {
              handleBlockDelete(id);
              return true;
            },
          },
          {
            key: "Ctrl-Delete",
            run: (view: EditorView) => {
              handleBlockDelete(id);
              return true;
            },
          },
          {
            key: "Ctrl-ArrowRight",
            run: (view: EditorView) => {
              handleBlockIndent(id);
              return true;
            },
          },
          {
            key: "Ctrl-ArrowLeft",
            run: (view: EditorView) => {
              handleBlockOutdent(id);
              return true;
            },
          },
          {
            key: "Ctrl-ArrowUp",
            run: (view: EditorView) => {
              handleBlockMoveUp(id);
              return true;
            },
          },
          {
            key: "Ctrl-ArrowDown",
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
    };
  }, []);

  return <div ref={editorRef} />;
}

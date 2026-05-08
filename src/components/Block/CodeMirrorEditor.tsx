import { EditorState, EditorSelection } from "@codemirror/state";
import { EditorView } from "codemirror";
import { getBlock } from "esm-treero-api";
import { useEffect, useRef } from "react";
import { yCollab } from "y-codemirror.next";
import yjs from "../../store/yjsManager";

export default function CodeMirrorEditor({ id, charIndex, setIsEdit }: { id: string; charIndex: number; setIsEdit: CallableFunction }) {
  const editorRef = useRef(null);

  const yblock = getBlock(yjs.ydoc, id);

  useEffect(() => {
    const ytext = yblock.get("content");

    const theme = EditorView.theme({
      // "&": {
      //   fontFamily: "Roboto, Inter, Arial, system-ui, Avenir, Helvetica, sans-serif",
      //   fontSize: "16px",
      //   lineHeight: "1.25",
      // },
      ".cm-content": {
        // This targets the actual text area
        // fontFamily: "Roboto, Inter, Arial, system-ui, Avenir, Helvetica, sans-serif",
        // fontSize: "16px",
        // lineHeight: "16px",
        fontFamily: "Roboto, Inter, Arial, system-ui, Avenir, Helvetica, sans-serif",
        fontSize: "16px",
        lineHeight: "1.25",
        padding: "0px",
      },
      ".cm-line": {
        padding: "0px 6px 0px 6px",
      },
      // ".cm-gutters": {
      //   // If you kept the line numbers, style them here too
      //   fontFamily: "inherit",
      // },
      "&.cm-focused": {
        // This removes the browser's default focus ring
        outline: "none",
      },
    });

    const blurHandler = EditorView.domEventHandlers({
      blur: (event, view) => {
        console.log("Editor lost focus", event);
        setIsEdit(false);
      },
      focus: (event, view) => {
        console.log("Editor gained focus");
      },
    });

    const state = EditorState.create({
      doc: ytext.toString(),
      extensions: [
        // basicSetup,
        theme,
        blurHandler,
        EditorView.lineWrapping,
        // @ts-ignore
        yCollab(ytext, null, { undoManager: yjs.undoManager! }),
      ],
    });

    const view = new EditorView({
      state,
      parent: editorRef.current!,
    });

    view.focus();
    view.dispatch({
      selection: EditorSelection.cursor(charIndex),
      scrollIntoView: true,
    });

    return () => {
      view.destroy();
    };
  }, []);

  return <div ref={editorRef} />;
}

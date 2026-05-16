import { defaultKeymap, history } from "@codemirror/commands";
import { Annotation, EditorSelection, EditorState, Transaction } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { getItem, isRootItem, updateBlock } from "esm-treero-api";
import { memo, useEffect, useMemo, useRef } from "react";
// import { yCollab } from "y-codemirror.next";
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
import yjs from "../../store/yjsManager";
import useZustandStore from "../../store/useZustandStore";
import type { YTextEvent, Transaction as YTransaction } from "yjs";

const CM6PlainTextEditor = memo(({ id, charIndex, setIsEdit }: { id: string; charIndex: number; setIsEdit: CallableFunction }) => {
  // export default function CM6PlainTextEditor({ id, charIndex, setIsEdit }: { id: string; charIndex: number; setIsEdit: CallableFunction }) {
  console.debug("CM6PlainTextEditor", id, charIndex);
  const editorRef = useRef<HTMLDivElement>(null);
  // const viewRef = useRef<EditorView | null>(null);

  const yblock = useMemo(() => getItem(yjs.yblocks, id), [id]);

  useEffect(() => {
    console.debug("CM6PlainTextEditor:useEffect");
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
        padding: "4px 6px 4px 6px",
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
        const relatedTarget = event.relatedTarget as HTMLElement | null;
        console.debug("CM6PlainTextEditor:blur", relatedTarget);
        if (!document.hasFocus()) {
          return;
        }
        if (relatedTarget instanceof HTMLElement && relatedTarget.dataset.ignoreBlur === "true") {
          event.preventDefault();
          console.debug("CM6PlainTextEditor:blur prevent", view.state.selection.main.head);
          if (relatedTarget.classList.contains("AddBlock")) {
            setTimeout(() => {
              setIsEdit(false);
            }, 200);
          } else if (relatedTarget.classList.contains("MoveBlockDown")) {
            requestAnimationFrame(() => {
              console.debug("requestIdleCallback");
              view.focus();
              view.dispatch({
                selection: EditorSelection.cursor(view.state.selection.main.head),
                scrollIntoView: true,
              });
            });
            // setTimeout(() => {
            //   view.focus();
            //   view.dispatch({
            //     selection: EditorSelection.cursor(view.state.selection.main.head),
            //     scrollIntoView: true,
            //   });
            // }, 200);
          } else {
            requestAnimationFrame(() => {
              view.focus();
              view.dispatch({
                selection: EditorSelection.cursor(view.state.selection.main.head),
                scrollIntoView: true,
              });
            });
            // Needed for keyboard persist
            // view.focus();
            // view.dispatch({
            //   selection: EditorSelection.cursor(view.state.selection.main.head),
            //   scrollIntoView: true,
            // });
            // setIsEdit(true);
            // Needed for cursor
            // setTimeout(() => {
            //   // editorRef.current?.scrollIntoView({
            //   //   behavior: "smooth", //
            //   //   block: "nearest",
            //   // });
            //   // setIsEdit(true);
            //   view.focus();
            //   view.dispatch({
            //     selection: EditorSelection.cursor(view.state.selection.main.head),
            //     scrollIntoView: true,
            //   });
            // }, 200);
          }
          return;
        }

        // if (view.state.doc.length === 0) {
        //   if (isRootItem(yjs.yblocks, id)) {
        //     console.debug("updateBlock");
        //     updateBlock(yjs.ydoc, id, { content: "Untitled" });
        //   }
        // }
        if (useZustandStore.getState().selectedBlockId === id) {
          useZustandStore.setState({ selectedBlockId: null });
        }
        // useZustandStore.getState().rerenderPage();
        setIsEdit(false);
      },
      focus: (event: FocusEvent, view: EditorView) => {
        console.debug("CM6PlainTextEditor:focus");
        useZustandStore.setState({ selectedBlockId: id });
      },
    });

    const CustomAnnotation = Annotation.define<string>();

    const shortcutsKeymap = keymap.of([
      {
        key: "Mod-z",
        run: (view: EditorView) => {
          console.debug("Undo");
          yjs.undoManager?.undo();
          const text = ytext.toString();
          if (view.state.doc.toString() !== ytext.toString()) {
            view.dispatch({
              changes: {
                from: 0,
                to: view.state.doc.length,
                insert: text,
              },
              selection: EditorSelection.cursor(Math.min(text.length, view.state.selection.main.head)),
              // scrollIntoView: true,
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
          console.debug("Redo");
          yjs.undoManager?.redo();
          const text = ytext.toString();
          if (view.state.doc.toString() !== text) {
            view.dispatch({
              changes: {
                from: 0,
                to: view.state.doc.length,
                insert: text,
              },
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
        run: (view: EditorView) => {
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
        run: (view: EditorView) => {
          handleBlockDelete(id);

          useZustandStore.getState().renderPage();
          return true;
        },
      },
      {
        key: "Mod-Delete",
        run: (view: EditorView) => {
          handleBlockDelete(id);

          useZustandStore.getState().renderPage();
          return true;
        },
      },
      {
        key: "Mod-ArrowRight",
        run: (view: EditorView) => {
          handleBlockIndent(id);

          useZustandStore.getState().renderPage();
          return true;
        },
      },
      {
        key: "Mod-ArrowLeft",
        run: (view: EditorView) => {
          handleBlockOutdent(id);

          useZustandStore.getState().renderPage();
          return true;
        },
      },
      {
        key: "Mod-ArrowUp",
        run: (view: EditorView) => {
          handleBlockMoveUp(id);

          useZustandStore.getState().renderPage();
          return true;
        },
      },
      {
        key: "Mod-ArrowDown",
        run: (view: EditorView) => {
          handleBlockMoveDown(id);

          useZustandStore.getState().renderPage();
          return true;
        },
      },
      ...defaultKeymap,
    ]);

    const updateListener = EditorView.updateListener.of((update) => {
      if (!update.docChanged) return;

      const tr = update.transactions[0];
      const tag = tr.annotation(CustomAnnotation);
      if (tag === "customundoredo") {
        return;
      }

      update.changes.iterChanges((fromA, toA, fromB, toB, inserted) => {
        const insertedText = inserted.toString();
        const deletedText = update.startState.doc.sliceString(fromA, toA);

        console.log({
          fromA,
          toA,
          fromB,
          toB,
          insertedText,
          deletedText,
        });
        // console.log("TRANSACTION", tr.annotation(Transaction.userEvent));
        // tr.isUserEvent("undo")

        const deletedLength = toA - fromA;

        if (deletedLength > 0) {
          ytext.delete(fromA, deletedLength);
        }

        // then insert
        if (insertedText.length > 0) {
          ytext.insert(fromA, insertedText);
        }
      });
    });

    const state = EditorState.create({
      doc: ytext.toString(),
      extensions: [
        // basicSetup,
        theme,
        // history(),
        shortcutsKeymap,
        domEventHandlers,
        updateListener,
        EditorView.lineWrapping,
        // @ts-ignore
        // yCollab(ytext, null, { undoManager: yjs.undoManager! }),
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

    setTimeout(() => {
      view.dispatch({
        scrollIntoView: true,
      });
    }, 200);

    // Handles changes from remote that come during edit
    function ytextObserver(event: YTextEvent, transaction: YTransaction) {
      if (transaction.origin) {
        console.info("ytext.observe", event, transaction);
        const text = ytext.toString();
        if (view.state.doc.toString() !== text) {
          view.dispatch({
            changes: {
              from: 0,
              to: view.state.doc.length,
              insert: text,
            },
            annotations: CustomAnnotation.of("customundoredo"),
          });
          try {
            view.dispatch({
              selection: EditorSelection.cursor(Math.max(text.length, view.state.selection.main.head)),
              annotations: CustomAnnotation.of("customundoredo"),
            });
          } catch {}
        }
      }
    }

    // @ts-ignore
    ytext.observe(ytextObserver);

    return () => {
      view.destroy();
      // @ts-ignore
      ytext.unobserve(ytextObserver);
      // viewRef.current = null;
    };
  }, []);

  return <div ref={editorRef} />;
});
export default CM6PlainTextEditor;

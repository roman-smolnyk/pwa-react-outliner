import { defaultKeymap } from "@codemirror/commands";
import { Annotation, EditorSelection } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import type { Transaction as YTransaction, Text as YText, YTextEvent } from "yjs";
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

export const CustomAnnotation = Annotation.define<string>();

export function resolveIndex(index: number, docLength: number): number {
  if (index < 0) return Math.max(0, docLength + index + 1);
  return Math.min(index, docLength);
}

export function createDomEventHandlers(id: string, setIsEdit: CallableFunction) {
  return EditorView.domEventHandlers({
    blur: (event: FocusEvent, view: EditorView) => {
      const relatedTarget = event.relatedTarget as HTMLElement | null;
      console.debug("CM6:blur", id, relatedTarget);

      if (!document.hasFocus()) return;

      if (relatedTarget instanceof HTMLElement && relatedTarget.dataset.ignoreBlur === "true") {
        event.preventDefault();
        if (relatedTarget.classList.contains("AddBlock")) {
          setTimeout(() => {
            setIsEdit(false);
          }, 200);
        } else if (relatedTarget.classList.contains("MoveBlockDown")) {
          requestAnimationFrame(() => {
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
          // MoveBlockDown and all other toolbar buttons: restore focus + cursor
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

    focus: () => {
      console.debug("CM6:focus", id);
      useZustandStore.setState({ selectedBlockId: id });
    },
  });
}

export function createShortcutsKeymap(id: string, ytext: YText | any) {
  return keymap.of([
    {
      key: "Mod-z",
      run: (view) => {
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
      run: (view) => {
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
      run: (view) => {
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
      run: (view) => {
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
}

export function createUpdateListener(ytext: YText | any) {
  return EditorView.updateListener.of((update) => {
    if (!update.docChanged) return;
    if (update.transactions[0]?.annotation(CustomAnnotation) === "customundoredo") return;

    update.changes.iterChanges((fromA, toA, _fromB, _toB, inserted) => {
      const insertedText = inserted.toString();
      //   const deletedText = update.startState.doc.sliceString(fromA, toA);
      //   console.log({
      //     fromA,
      //     toA,
      //     _fromB,
      //     _toB,
      //     insertedText,
      //     deletedText,
      //   });
      const deletedLength = toA - fromA;
      if (deletedLength > 0) ytext.delete(fromA, deletedLength);
      if (insertedText.length > 0) ytext.insert(fromA, insertedText);
    });
  });
}

export function createYtextObserver(view: EditorView, ytext: YText | any) {
  return function ytextObserver(event: YTextEvent | any, transaction: YTransaction | any) {
    if (!transaction.origin) return; // Remote transaction has origin attr
    console.info("CM6:ytext.observe remote change");
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
  };
}

export const sharedTheme = EditorView.theme({
  "&.cm-focused": { outline: "none" },
  ".cm-line": { padding: "0" },
  ".cm-lineWrapping": { whiteSpace: "pre-wrap" },
});

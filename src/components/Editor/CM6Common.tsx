import { defaultKeymap } from "@codemirror/commands";
import { Annotation, EditorSelection } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import log from "loglevel";
import type { Text as YText, YTextEvent, Transaction as YTransaction } from "yjs";
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

export function makeBold(view: EditorView) {
  log.debug("makeBold");
  const { main } = view.state.selection;

  if (main.empty) {
    // Case 1: Cursor is empty -> Insert **** and put cursor in the middle
    view.dispatch({
      changes: { from: main.from, insert: "****" },
      selection: EditorSelection.cursor(main.from + 2),
      scrollIntoView: true,
    });
    return true;
  }

  // Case 2: Text is selected -> Check if it's already bolded
  const from = main.from;
  const to = main.to;

  // Fetch the characters immediately outside the selection bounds
  const leftChars = view.state.doc.sliceString(Math.max(0, from - 2), from);
  const rightChars = view.state.doc.sliceString(to, Math.min(view.state.doc.length, to + 2));

  // Fetch the characters inside the edge of the selection bounds
  const insideLeftChars = view.state.doc.sliceString(from, from + 2);
  const insideRightChars = view.state.doc.sliceString(to - 2, to);

  // Scenario A: Selection is strictly INSIDE asterisks -> **|text|**
  if (leftChars === "**" && rightChars === "**") {
    const selectedText = view.state.doc.sliceString(from, to);
    view.dispatch({
      // Target the asterisks outside the selection to remove them
      changes: { from: from - 2, to: to + 2, insert: selectedText },
      selection: EditorSelection.range(from - 2, to - 2),
      scrollIntoView: true,
    });
  }
  // Scenario B: Selection INCLUDES the asterisks -> |**text**|
  else if (insideLeftChars === "**" && insideRightChars === "**" && to - from >= 4) {
    const cleanText = view.state.doc.sliceString(from + 2, to - 2);
    view.dispatch({
      changes: { from: from, to: to, insert: cleanText },
      selection: EditorSelection.range(from, to - 4),
      scrollIntoView: true,
    });
  }
  // Scenario C: Text is not bolded yet -> Wrap it -> **text**
  else {
    const selectedText = view.state.doc.sliceString(from, to);
    view.dispatch({
      changes: { from: from, to: to, insert: `**${selectedText}**` },
      selection: EditorSelection.range(from, to + 4),
      scrollIntoView: true,
    });
  }

  return true;
}

export const CustomAnnotation = Annotation.define<string>();

export function resolveIndex(index: number, docLength: number): number {
  if (index < 0) return Math.max(0, docLength + index + 1);
  return Math.min(index, docLength);
}

export function createDomEventHandlers(id: string, setIsEdit: (v: boolean) => void) {
  return EditorView.domEventHandlers({
    blur: (event: FocusEvent, view: EditorView) => {
      const relatedTarget = event.relatedTarget as HTMLElement | null;
      log.debug("CM6:blur", id, relatedTarget);

      // if (!document.hasFocus()) return; TODO: regain focus when document in view again

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
              selection: view.state.selection,
              scrollIntoView: true,
            });
          });
        } else {
          // MoveBlockDown and all other toolbar buttons: restore focus + cursor
          requestAnimationFrame(() => {
            view.focus();
            view.dispatch({
              selection: view.state.selection,
              scrollIntoView: true,
            });
          });
        }
        return true;
      }

      if (useZustandStore.getState().selectedBlockId === id) {
        useZustandStore.setState({ selectedBlockId: null, editorView: null });
      }
      setIsEdit(false);
    },

    focus: (event: FocusEvent, view: EditorView) => {
      log.debug("CM6:focus", id);
      // useZustandStore.setState({ selectedBlockId: id, editorView: view });
      // setIsEdit(true);
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
          handleBlockSelectUp(id, useZustandStore.getState().rootBlockId);
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
          handleBlockSelectDown(id, useZustandStore.getState().rootBlockId);
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
    {
      key: "Mod-b",
      run: makeBold,
      preventDefault: true,
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
      //   log.log({
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
    log.debug("ytextObserver");
    if (!transaction.origin) return; // Remote transaction has origin attr
    log.info("CM6:ytext.observe remote change");
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

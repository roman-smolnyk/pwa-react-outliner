import { Annotation, EditorSelection } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import log from "loglevel";
import type { RefObject } from "react";
import type { Text as YText, YTextEvent, Transaction as YTransaction } from "yjs";

export const CustomAnnotation = Annotation.define<string>();

export function resolveIndex(index: number, docLength: number): number {
  if (index < 0) return Math.max(0, docLength + index + 1);
  return Math.min(index, docLength);
}

export function createDomEventHandlers(id: string, isDestroyingRef: RefObject<boolean | null>) {
  return EditorView.domEventHandlers({
    blur: (event: FocusEvent, view: EditorView) => {
      const relatedTarget = event.relatedTarget as HTMLElement | null;
      log.debug("CM6:blur", id, relatedTarget, document.activeElement);

      // Sometimes on mobile it helps
      // view.focus();
      // view.dispatch({
      //   selection: view.state.selection,
      //   scrollIntoView: true,
      // });

      if (!isDestroyingRef.current) {
        requestAnimationFrame(() => {
          view.focus();
          view.dispatch({
            selection: view.state.selection,
            scrollIntoView: true,
          });
        });
      }

      return true;
    },

    // focus: (event: FocusEvent, view: EditorView) => {
    //   log.debug("CM6:focus", id);
    // },
  });
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
  ".cm-scroller": { lineHeight: "inherit" },
});

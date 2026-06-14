import { defaultKeymap } from "@codemirror/commands";
import { Annotation, EditorSelection } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import log from "loglevel";
import type { RefObject } from "react";
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
  handleRedo,
  handleUndo,
  toggleGlobalSearch,
  togglePageSearch,
} from "../../api/api";
import useStore from "../../store/useStore";

export interface FormattingOptions {
  syntax?: string;
  open?: string;
  close?: string;
}

export function toggleInlineFormatting(view: EditorView, options: string | FormattingOptions): boolean {
  const open = typeof options === "string" ? options : (options.open ?? options.syntax ?? "");
  const close = typeof options === "string" ? options : (options.close ?? options.syntax ?? "");

  if (!open && !close) return false;

  log.debug(`toggleInlineFormatting: open='${open}', close='${close}'`);

  const { main } = view.state.selection;
  const openLen = open.length;
  const closeLen = close.length;

  // Case 1: No text selected
  if (main.empty) {
    const pos = main.from;

    const leftChars = view.state.doc.sliceString(Math.max(0, pos - openLen), pos);
    const rightChars = view.state.doc.sliceString(pos, Math.min(view.state.doc.length, pos + closeLen));

    // If already wrapped in syntax (e.g., **|**), remove them
    if (leftChars === open && rightChars === close) {
      view.dispatch({
        changes: { from: pos - openLen, to: pos + closeLen, insert: "" },
        selection: EditorSelection.cursor(pos - openLen),
        scrollIntoView: true,
      });
      return true;
    }

    // Default: Insert syntax twice (e.g., ****) and put cursor in the middle
    view.dispatch({
      changes: { from: pos, insert: open + close },
      selection: EditorSelection.cursor(pos + openLen),
      scrollIntoView: true,
    });
    return true;
  }

  // Case 2: Text is selected
  const { from, to } = main;

  const leftChars = view.state.doc.sliceString(Math.max(0, from - openLen), from);
  const rightChars = view.state.doc.sliceString(to, Math.min(view.state.doc.length, to + closeLen));

  const insideLeftChars = view.state.doc.sliceString(from, from + openLen);
  const insideRightChars = view.state.doc.sliceString(to - closeLen, to);

  // Scenario A: Selection is strictly INSIDE syntax -> **|text|**
  if (leftChars === open && rightChars === close) {
    const selectedText = view.state.doc.sliceString(from, to);
    view.dispatch({
      changes: { from: from - openLen, to: to + closeLen, insert: selectedText },
      selection: EditorSelection.range(from - openLen, to - openLen),
      scrollIntoView: true,
    });
  }
  // Scenario B: Selection INCLUDES the syntax -> |**text**|
  else if (insideLeftChars === open && insideRightChars === close && to - from >= openLen + closeLen) {
    const cleanText = view.state.doc.sliceString(from + openLen, to - closeLen);
    view.dispatch({
      changes: { from: from, to: to, insert: cleanText },
      selection: EditorSelection.range(from, to - (openLen + closeLen)),
      scrollIntoView: true,
    });
  }
  // Scenario C: Text is not formatted yet -> Wrap it ->
  else {
    const selectedText = view.state.doc.sliceString(from, to);
    view.dispatch({
      changes: { from: from, to: to, insert: `${open}${selectedText}${close}` },
      selection: EditorSelection.range(from, to + openLen + closeLen),
      scrollIntoView: true,
    });
  }

  return true;
}

export function addHeading(view: EditorView) {
  log.debug("addHeading");
  const { main } = view.state.selection;
  const pos = main.from;
  const line = view.state.doc.lineAt(pos);

  // Case 1: No text selected
  if (main.empty) {
    const textBeforeCursor = line.text.slice(0, pos - line.from);
    const trailingHeadingMatch = textBeforeCursor.match(/(#+)\s*$/);

    if (trailingHeadingMatch) {
      const existingHashes = trailingHeadingMatch[1];
      const matchLength = trailingHeadingMatch[0].length;
      const targetFrom = pos - matchLength;

      const nextInsert = existingHashes.length >= 6 ? "# " : "#" + existingHashes + " ";

      view.dispatch({
        changes: { from: targetFrom, to: pos, insert: nextInsert },
        selection: EditorSelection.cursor(targetFrom + nextInsert.length),
        scrollIntoView: true,
      });
      return true;
    }

    view.dispatch({
      changes: { from: pos, insert: "# " },
      selection: EditorSelection.cursor(pos + 2),
      scrollIntoView: true,
    });
    return true;
  }

  // Case 2: Text is selected
  const from = main.from;
  const to = main.to;

  // 1. Check if the selection ITSELF starts with hashes (e.g., |# Selection|)
  const selectedText = view.state.doc.sliceString(from, to);
  const internalMatch = selectedText.match(/^(#+)\s*/);

  if (internalMatch) {
    const existingHashes = internalMatch[1];
    const charsToReplace = internalMatch[0].length;
    const cleanTextBody = selectedText.slice(charsToReplace);

    const newHeadingPrefix = existingHashes.length >= 6 ? "# " : "#" + existingHashes + " ";
    const finalInsertedText = newHeadingPrefix + cleanTextBody;

    view.dispatch({
      changes: { from: from, to: to, insert: finalInsertedText },
      selection: EditorSelection.range(from, from + finalInsertedText.length),
      scrollIntoView: true,
    });
    return true;
  }

  // 2. NEW FIX: Check if hashes exist directly BEFORE the selection (e.g., # |Selection|)
  const textBeforeSelection = line.text.slice(0, from - line.from);
  const externalMatch = textBeforeSelection.match(/(#+)\s*$/);

  if (externalMatch) {
    const existingHashes = externalMatch[1];
    const matchLength = externalMatch[0].length;
    // Determine where the external hashes start on the line
    const targetFrom = from - matchLength;

    // Cycle condition: if 6, cycle back to 1. Otherwise, increment.
    const newHeadingPrefix = existingHashes.length >= 6 ? "# " : "#" + existingHashes + " ";

    view.dispatch({
      // Replace from the start of the external hashes up to the end of your selection
      changes: { from: targetFrom, to: to, insert: newHeadingPrefix + selectedText },
      // Recalculate your selection bounds so it covers the modified text block perfectly
      selection: EditorSelection.range(targetFrom, targetFrom + newHeadingPrefix.length + selectedText.length),
      scrollIntoView: true,
    });
    return true;
  }

  // 3. Fallback: No hashes found inside or outside the selection -> Simply prepend "# "
  const finalInsertedText = "# " + selectedText;
  view.dispatch({
    changes: { from: from, to: to, insert: finalInsertedText },
    selection: EditorSelection.range(from, from + finalInsertedText.length),
    scrollIntoView: true,
  });

  return true;
}

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

export function createShortcutsKeymap(id: string, ytext: YText | any) {
  return keymap.of([
    {
      key: "Mod-z",
      run: (view) => {
        handleUndo();
        const text = ytext.toString();
        if (view.state.doc.toString() !== text) {
          view.dispatch({
            changes: { from: 0, to: view.state.doc.length, insert: text },
            selection: EditorSelection.cursor(Math.min(text.length, view.state.selection.main.head)),
            annotations: CustomAnnotation.of("customundoredo"),
          });
        }
        return true;
      },
    },
    {
      key: "Mod-Shift-z",
      run: (view) => {
        handleRedo();
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
        return true;
      },
    },
    {
      key: "ArrowUp",
      run: (view) => {
        if (view.state.selection.main.head === 0) {
          handleBlockSelectUp(id, useStore.getState().rootBlockId);
          return true;
        }
        useStore.getState().renderPage();
        return false;
      },
    },
    {
      key: "ArrowDown",
      run: (view) => {
        if (view.state.selection.main.head === view.state.doc.length) {
          handleBlockSelectDown(id, useStore.getState().rootBlockId);
          return true;
        }
        useStore.getState().renderPage();
        return false;
      },
    },
    {
      key: "Mod-Enter",
      run: () => {
        handleBlockAdd(id);
        useStore.getState().renderPage();
        return true;
      },
    },
    {
      key: "Backspace",
      run: (view: EditorView) => {
        if (view.state.doc.length === 0) {
          handleBlockDelete(id);
          useStore.getState().renderPage();
          return true;
        }
        return false;
      },
    },
    {
      key: "Mod-Backspace",
      run: () => {
        handleBlockDelete(id);
        useStore.getState().renderPage();
        return true;
      },
    },
    {
      key: "Mod-Delete",
      run: () => {
        handleBlockDelete(id);
        useStore.getState().renderPage();
        return true;
      },
    },
    {
      key: "Mod-ArrowRight",
      run: () => {
        handleBlockIndent(id);
        useStore.getState().renderPage();
        return true;
      },
    },
    {
      key: "Mod-ArrowLeft",
      run: () => {
        handleBlockOutdent(id);
        useStore.getState().renderPage();
        return true;
      },
    },
    {
      key: "Mod-ArrowUp",
      run: () => {
        handleBlockMoveUp(id);
        useStore.getState().renderPage();
        return true;
      },
    },
    {
      key: "Mod-ArrowDown",
      run: () => {
        handleBlockMoveDown(id);
        useStore.getState().renderPage();
        return true;
      },
    },
    {
      key: "Mod-h",
      run: addHeading,
      preventDefault: true,
    },
    {
      key: "Mod-b",
      run: (view) => {
        return toggleInlineFormatting(view, "**");
      },
      preventDefault: true,
    },
    {
      key: "Mod-i",
      run: (view) => {
        return toggleInlineFormatting(view, "_");
      },
      preventDefault: true,
    },
    {
      key: "Mod-s",
      run: (view) => {
        return toggleInlineFormatting(view, "~~");
      },
      preventDefault: true,
    },
    {
      key: "Mod-`",
      run: (view) => {
        return toggleInlineFormatting(view, "```\n");
      },
      preventDefault: true,
    },
    {
      key: "Mod-f",
      run: (view) => {
        togglePageSearch();
        return true;
      },
      preventDefault: true,
    },
    {
      key: "Mod-Shift-f",
      run: (view) => {
        toggleGlobalSearch();
        return true;
      },
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
  ".cm-scroller": { lineHeight: "inherit" },
});

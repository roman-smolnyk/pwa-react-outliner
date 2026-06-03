// src/components/Editor/CM6Editor.tsx
import { syntaxTree } from "@codemirror/language";
import { type EditorState, RangeSetBuilder } from "@codemirror/state";
import type { DecorationSet, ViewUpdate } from "@codemirror/view";
import { Decoration, EditorView, ViewPlugin } from "@codemirror/view";

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

export const livePreviewPlugin = ViewPlugin.fromClass(
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

export const markdownTheme = EditorView.theme({
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

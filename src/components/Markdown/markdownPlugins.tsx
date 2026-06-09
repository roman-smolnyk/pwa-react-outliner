import type { Root, Text } from "mdast";
import type { Node, Parent } from "unist";
import { visit } from "unist-util-visit";
// import { findAndReplace } from "mdast-util-find-and-replace";

/*
remarkPlugins uses MDAST (Markdown AST).
rehypePlugins uses HAST (HTML AST)
Under the hood mdast-util-to-hast used
*/

// Define a generic Custom Node structure to share between features
interface CustomInlineNode extends Node {
  type: string;
  data: {
    hName: string;
    hProperties?: Record<string, unknown>;
    hChildren?: Text[];
  };
}

// Extend the MDAST content maps cleanly
declare module "mdast" {
  interface RootContentMap {
    highlight: CustomInlineNode;
    spoiler: CustomInlineNode;
  }
}

/**
 * Escape special regex characters like |, +, *, etc.
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * DRY Factory function to create custom inline markdown token matchers
 */
function createCustomMarkerPlugin(options: { marker: string; nodeType: string; className: string }) {
  const { marker, nodeType, className } = options;
  // Safely escape the marker (e.g. "||" becomes "\|\|")
  const escapedMarker = escapeRegExp(marker);
  const regex = new RegExp(`${escapedMarker}(.+?)${escapedMarker}`, "g");

  return () => {
    return (tree: Root) => {
      // We typecast parent here to safely manipulate its children
      visit(tree, "text", (node: Text, index, parent: Parent | undefined) => {
        if (!parent || typeof index !== "number") return;

        const text = node.value;
        const matches = [...text.matchAll(regex)];

        if (matches.length === 0) return;

        const newNodes: (Text | CustomInlineNode)[] = [];
        let lastIndex = 0;

        matches.forEach((match) => {
          const [full, content] = match;
          const start = match.index ?? 0;

          // Add normal text preceding the match
          if (start > lastIndex) {
            newNodes.push({
              type: "text",
              value: text.slice(lastIndex, start),
            });
          }

          // Add our custom markdown node
          newNodes.push({
            type: nodeType,
            data: {
              hName: "span",
              hProperties: { className: [className] },
              hChildren: [{ type: "text", value: content }],
            },
          });

          lastIndex = start + full.length;
        });

        // Add remaining trailing text
        if (lastIndex < text.length) {
          newNodes.push({
            type: "text",
            value: text.slice(lastIndex),
          });
        }

        // Replace the old text node with our broken down fragments
        parent.children.splice(index, 1, ...newNodes);
      });
    };
  };
}

// ==highlight==
export const remarkHighlight = createCustomMarkerPlugin({
  marker: "==",
  nodeType: "highlight",
  className: "md-highlight",
});

// ||spoiler||
export const remarkSpoiler = createCustomMarkerPlugin({
  marker: "||",
  nodeType: "spoiler",
  className: "md-spoiler",
});

export function remarkPreserveNewlines() {
  return (tree: Root) => {
    visit(tree, "paragraph", (_node, index, parent) => {
      if (!parent || typeof index !== "number") return;

      // log.debug("remarkPreserveNewlines", node);

      // const parts = node.value.split("\n");
      // if (parts.length > 1) {
      //   const newNodes: (Text | Break)[] = [];
      //   parts.forEach((part, i) => {
      //     if (part) newNodes.push({ type: "text", value: part });
      //     if (i < parts.length - 1) {
      //       newNodes.push({ type: "break" }); // <br/>
      //     }
      //   });
      //   parent.children.splice(index, 1, ...newNodes);
      // }
    });
  };
}

// export function remarkBreaksClone() {
//   function replace(match: string) {
//     return {
//       type: 'element',  // for HTML elements in mdast
//       tagName: 'br',
//       children: [],
//     };
//   }

//   function transform(markdownAST: any) {
//     // Pass as a tuple [pattern, replacement]
//     findAndReplace(markdownAST, [[/\n/g, replace]]);
//     return markdownAST;
//   }

//   return transform;
// }

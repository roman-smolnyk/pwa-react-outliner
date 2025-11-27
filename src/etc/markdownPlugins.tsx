import type { Root, Text } from "mdast";
import type { Node } from "unist";
import { visit } from "unist-util-visit";
// import { findAndReplace } from "mdast-util-find-and-replace";

/*
remarkPlugins uses MDAST (Markdown AST).
rehypePlugins uses HAST (HTML AST)
Under the hood mdast-util-to-hast used
*/

interface Highlight extends Node {
  type: "highlight";
  data: {
    hName: string;
    hProperties?: Record<string, unknown>;
    hChildren?: Text[];
  };
}

declare module "mdast" {
  interface RootContentMap {
    highlight: Highlight;
  }
}

// Custom plugin to detect ==highlight==
export function remarkHighlight() {
  return (tree: Root) => {
    visit(tree, "text", (node, index, parent) => {
      if (!parent || typeof index !== "number") return;
      const regex = /==(.+?)==/g;
      const text = node.value;
      const matches = [...text.matchAll(regex)];
      if (matches.length > 0) {
        const newNodes: (Text | Highlight)[] = [];
        let lastIndex = 0;

        matches.forEach((match) => {
          const [full, content] = match;
          const start = match.index;

          // Normal text before highlight
          if (start > lastIndex) {
            newNodes.push({
              type: "text",
              value: text.slice(lastIndex, start),
            });
          }

          newNodes.push({
            type: "highlight", // custom mdast node type
            data: {
              hName: "span", // custom html tag
              hProperties: { className: ["md-highlight"] }, // props for the element
              hChildren: [{ type: "text", value: content }],
            },
          });

          lastIndex = start + full.length;
        });

        // Remaining text
        if (lastIndex < node.value.length) {
          newNodes.push({
            type: "text",
            value: node.value.slice(lastIndex),
          });
        }

        parent.children.splice(index, 1, ...newNodes);
      }
    });
  };
}

export function remarkPreserveNewlines() {
  return (tree: Root) => {
    visit(tree, "paragraph", (node, index, parent) => {
      if (!parent || typeof index !== "number") return;

      console.debug("remarkPreserveNewlines", node);

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

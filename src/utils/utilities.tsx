import { arrayMove } from "@dnd-kit/sortable";
import type { YBlocksMap, YExplorerMap } from "esm-treero-api";
import * as Y from "yjs";
import { MOBILE_WIDTH } from "../../config";

type TreeItem = {
  id: string;
  parent_id?: string | null;
  children?: string[];
  collapsed?: boolean;
};

type Flattened<T> = T & {
  depth: number;
  index: number;
};

export function flattenTree<T extends TreeItem>(treeItems: Record<string, T>, rootId: string): Flattened<T>[] {
  const result: Flattened<T>[] = [];

  function flattener(id: string, depth: number) {
    const item = treeItems[id];
    if (!item) return;

    result.push({
      ...item,
      depth,
      index: result.length,
    });

    if (item.children) {
      for (const childId of item.children) {
        flattener(childId, depth + 1);
      }
    }
  }

  flattener(rootId, 0);
  return result;
}

export function flattenYTree<T extends YBlocksMap | YExplorerMap>(treeItems: T, rootId: string): Flattened<TreeItem>[] {
  const result: Flattened<TreeItem>[] = [];

  function flattener(id: string, depth: number) {
    const yitem = treeItems.get(id);
    if (!yitem) return;

    const item: any = {
      depth,
      index: result.length,
    };

    for (const [key, value] of yitem.entries()) {
      if (value instanceof Y.Text) {
        item[key] = value.toString();
      } else if (value instanceof Y.Array) {
        item[key] = value.toArray();
      } else {
        item[key] = value;
      }
    }

    result.push(item);

    const chidren = yitem.get("children");
    if (chidren) {
      for (const childId of chidren) {
        flattener(childId, depth + 1);
      }
    }
  }

  flattener(rootId, 0);
  return result;
}

export function flattenAndFilterYTree<T extends YBlocksMap | YExplorerMap>(
  treeItems: T,
  rootId: string,
  activeId: string | null,
  doNotCollapse?: boolean,
): Flattened<TreeItem>[] {
  const result: Flattened<TreeItem>[] = [];

  function flattener(id: string, depth: number) {
    const yitem = treeItems.get(id);
    if (!yitem) return;

    const item: any = {
      depth,
      index: result.length,
    };

    for (const [key, value] of yitem.entries()) {
      if (value instanceof Y.Text) {
        item[key] = value.toString();
      } else if (value instanceof Y.Array) {
        item[key] = value.toArray();
      } else {
        item[key] = value;
      }
    }

    result.push(item);

    // Early exit for children of the active item
    if (activeId !== null && id === activeId) return;

    const isCollapsed = !doNotCollapse && item.collapsed;
    if (isCollapsed && id !== rootId) return;

    const children = yitem.get("children");
    if (children) {
      for (const childId of children) {
        flattener(childId, depth + 1);
      }
    }
  }

  flattener(rootId, 0);
  return result;
}

export function removeChildrenOf(items: Flattened<TreeItem>[], ids: string[]): Flattened<TreeItem>[] {
  // * If planing to use again add fix: if (isCollapsed && id !== rootId) return;
  const excludeParentIds = [...ids];

  return items.filter((item) => {
    if (item.parent_id && excludeParentIds.includes(item.parent_id)) {
      if (item.children?.length) {
        excludeParentIds.push(item.id);
      }

      return false;
    }

    return true;
  });
}

export function getProjection<T extends Flattened<TreeItem>>(
  items: T[],
  activeId: string,
  overId: string,
  dragOffset: number,
  indentationWidth: number,
) {
  const overItemIndex = items.findIndex(({ id }) => id === overId);
  const activeItemIndex = items.findIndex(({ id }) => id === activeId);
  const activeItem = items[activeItemIndex];
  const newItems = arrayMove(items, activeItemIndex, overItemIndex);
  const previousItem = newItems[overItemIndex - 1];
  const nextItem = newItems[overItemIndex + 1];
  const dragDepth = getDragDepth(dragOffset, indentationWidth);
  const projectedDepth = activeItem.depth + dragDepth;
  const maxDepth = getMaxDepth(previousItem);
  const minDepth = getMinDepth(nextItem);
  let depth = projectedDepth;

  // console.debug("previousItem, nextItem", previousItem.id, nextItem.id);

  if (projectedDepth >= maxDepth) {
    depth = maxDepth;
  } else if (projectedDepth < minDepth) {
    depth = minDepth;
  }

  return { depth, maxDepth, minDepth, parentId: getParentId() };

  function getParentId() {
    if (depth === 0 || !previousItem) {
      return null;
    }

    if (depth === previousItem.depth) {
      return previousItem.parent_id;
    }

    if (depth > previousItem.depth) {
      return previousItem.id;
    }

    const newParent = newItems
      .slice(0, overItemIndex)
      .reverse()
      .find((item) => item.depth === depth)?.parent_id;

    return newParent ?? null;
  }
}

function getDragDepth(offset: number, indentationWidth: number): number {
  return Math.round(offset / indentationWidth);
}

function getMaxDepth<T extends Flattened<TreeItem>>(previousItem: T): number {
  if (previousItem) {
    return previousItem.depth + 1;
  }

  return 0;
}

function getMinDepth<T extends Flattened<TreeItem>>(nextItem: T): number {
  if (nextItem) {
    return nextItem.depth;
  }

  return 0;
}

function getCaretPosition(x: number, y: number) {
  if (document.caretPositionFromPoint) {
    const pos = document.caretPositionFromPoint(x, y);
    if (!pos) return null;
    return { node: pos.offsetNode, offset: pos.offset };
  } else if (document.caretRangeFromPoint) {
    const range = document.caretRangeFromPoint(x, y);
    if (!range) return null;
    return { node: range.startContainer, offset: range.startOffset };
  }
  return null;
}

export function getCharIndexFromMouse(element: HTMLElement, x: number, y: number) {
  const caret = getCaretPosition(x, y);
  if (!caret) return -1;

  let charIndex = 0;
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (node === caret.node) {
      charIndex += caret.offset;
      break;
    } else {
      charIndex += node.textContent?.length ?? 0;
    }
  }
  return charIndex;
}

export function isMobile(): boolean {
  // return window.matchMedia(`(max-width: ${MOBILE_WIDTH}px)`).matches;
  return window.innerWidth <= MOBILE_WIDTH;
}

export const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

export async function waitUntil(fn: CallableFunction, timeout = 5000, interval = 250) {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const result = await fn();
    if (result) return result;

    await sleep(interval);
  }

  return undefined; // Timed out
}

export function scrollIntoView(element: HTMLElement, container: HTMLElement) {
  const vv = window.visualViewport;
  if (!vv) return;

  const rect = element.getBoundingClientRect();

  container.scrollBy({
    top: rect.bottom - vv.height + vv.height / 2,
    behavior: "smooth",
  });
}

// import debounce from "lodash/debounce";
// import { useEffect, useRef, useState } from "react";
// import type {  } from "../types";

// export function forceReload() {
//   if ("serviceWorker" in navigator) {
//     navigator.serviceWorker.getRegistrations().then((registrations) => {
//       for (const reg of registrations) {
//         reg.update(); // fetch new SW and assets
//       }
//     });
//   }
//   window.location.replace(window.location.pathname + "?t=" + Date.now());
// }

// // export function debounce<T extends (...args: any[]) => void>(fn: T, delay: number): (...args: Parameters<T>) => void {
// //   let timerId: ReturnType<typeof setTimeout> | undefined;

// //   return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
// //     if (timerId !== undefined) {
// //       clearTimeout(timerId);
// //     }

// //     timerId = setTimeout(() => {
// //       fn.apply(this, args);
// //     }, delay);
// //   };
// // }

// export function isMobile(): boolean {
//   return window.matchMedia("(max-width: 639px)").matches;
// }

// export const ENGINE = {
//   GECKO: typeof (window as any).InstallTrigger !== "undefined",
//   BLINK: (window as any).chrome !== undefined,
// };

// export function genRandomToken(bytes = 32) {
//   const array = new Uint8Array(bytes);
//   crypto.getRandomValues(array);
//   return btoa(String.fromCharCode(...array))
//     .replace(/\+/g, "-")
//     .replace(/\//g, "_")
//     .replace(/=+$/, "");
// }

// export function useKeyboardOffset() {
//   const [offset, setOffset] = useState(0);

//   useEffect(() => {
//     if (!window.visualViewport) return;

//     const vv = window.visualViewport;

//     const update = () => {
//       const overlap = Math.max(0, window.innerHeight - (vv.height + vv.offsetTop));

//       setOffset(overlap);
//     };

//     update();
//     vv.addEventListener("resize", update);
//     vv.addEventListener("scroll", update);

//     return () => {
//       vv.removeEventListener("resize", update);
//       vv.removeEventListener("scroll", update);
//     };
//   }, []);

//   return offset;
// }

// export function scrollIntoView(element: HTMLElement, container: HTMLElement) {
//   if (element && container) {
//     const top = element.offsetTop - container.offsetTop;
//     container.scrollTo({ top });
//   }
// }

// export function arrayMove<T>(array: T[], from: number, to: number): T[] {
//   const newArray = array.slice(); // shallow copy
//   newArray.splice(
//     to < 0 ? newArray.length + to : to, // target index
//     0, // deleteCount = 0 (we're inserting)
//     newArray.splice(from, 1)[0], // remove item at "from" and insert it here
//   );
//   return newArray;
// }

// export function arrayRelativeMove<T>(array: T[], item: T, relativeTo: T, offset: number): T[] {
//   // ["A", "B", "C", "D", "E"]
//   // For convenience when user pass -1 in reality it should be 0 as on move shift to right happens
//   offset = offset < 0 ? offset + 1 : offset;
//   const newArray = array.slice(); // shallow copy

//   const itemIndex = newArray.indexOf(item);
//   const refIndex = newArray.indexOf(relativeTo);
//   if (itemIndex === -1 || refIndex === -1) return array;
//   // remove item first
//   const [removed] = newArray.splice(itemIndex, 1);

//   const currentRefIndex = newArray.indexOf(relativeTo);
//   // compute target index
//   let targetIndex = currentRefIndex + offset;

//   // clamp to array bounds
//   targetIndex = Math.max(0, Math.min(targetIndex, newArray.length));

//   newArray.splice(targetIndex, 0, removed);
//   // console.debug(
//   //   "arrayRelativeMove",
//   //   {
//   //     array: array,
//   //     item: item,
//   //     relativeTo: relativeTo,
//   //     offset: offset,
//   //     itemIndex: itemIndex,
//   //     refIndex: refIndex,
//   //     currentRefIndex: currentRefIndex,
//   //     targetIndex: targetIndex,
//   //   },
//   //   newArray,
//   // );

//   return newArray;
// }

// export function generateFlattenedNodes(nodes: Map<string, NodeDataType>, rootNodeId: string, activeId: string) {
//   if (!rootNodeId || !activeId) return [];

//   const flattenedTree = flattenFromMap(nodes, rootNodeId);

//   // Collect collapsed nodes
//   const collapsedItems = flattenedTree.reduce<string[]>((accumulator, { children, collapsed, node_id }) => {
//     if (collapsed && children.length) {
//       accumulator.push(node_id);
//     }
//     return accumulator;
//   }, []);

//   // Hide children of collapsed nodes and of the active dragged node
//   const flattenedNodes = removeChildrenOf(flattenedTree, activeId != null ? [activeId, ...collapsedItems] : collapsedItems);

//   return flattenedNodes;
// }

// export function flattenTreeFromMap(nodes: Map<string, NodeDataType>, rootNodeId: string): FlattenedNodeType[] {
//   return flattenFromMap(nodes, rootNodeId, null, 0);
// }

// export function flattenFromMap(nodes: Map<string, NodeDataType>, nodeId: string, parentId: string | null = null, depth = 0): FlattenedNodeType[] {
//   const node = nodes.get(nodeId);
//   if (!node) return [];

//   // current node
//   const current: FlattenedNodeType = {
//     node_id: node.node_id,
//     parent_id: parentId,
//     depth,
//     index: 0, // will be set by parent loop
//     collapsed: node.collapsed,
//     children: node.children,
//   };

//   // flatten children in order
//   const childrenFlat = node.children.flatMap((childId, _) =>
//     flattenFromMap(nodes, childId, node.node_id, depth + 1).map((item, i) => ({
//       ...item,
//       index: i,
//     })),
//   );

//   return [current, ...childrenFlat];
// }

// // from dnd-kit
// export function removeChildrenOf(items: FlattenedNodeType[], ids: string[]) {
//   const excludeParentIds = [...ids];

//   return items.filter((item) => {
//     if (item.parent_id && excludeParentIds.includes(item.parent_id)) {
//       if (item.children.length) {
//         excludeParentIds.push(item.node_id);
//       }
//       return false;
//     }

//     return true;
//   });
// }

// export function getProjection(items: FlattenedNodeType[], activeId: string, overId: string, dragOffset: number, indentOnOffset: number = 50) {
//   const overItemIndex = items.findIndex((item: FlattenedNodeType) => item.node_id === overId);
//   const activeItemIndex = items.findIndex((item: FlattenedNodeType) => item.node_id === activeId);
//   if (overItemIndex === -1 || activeItemIndex === -1) return null;
//   // const overItem = items[overItemIndex];
//   // const activeItem = items[activeItemIndex];

//   const newItems: FlattenedNodeType[] = arrayMove(items, activeItemIndex, overItemIndex);

//   const newOverItemIndex = newItems.findIndex((item: FlattenedNodeType) => item.node_id === overId);
//   const newActiveItemIndex = newItems.findIndex((item: FlattenedNodeType) => item.node_id === activeId);

//   const shouldIndent = dragOffset > indentOnOffset ? 1 : 0;
//   const position = newActiveItemIndex > newOverItemIndex ? "after" : "before";
//   const placement = shouldIndent ? "indent" : position;

//   return placement;
// }

// export function printDOM(element: HTMLElement, level = 0) {
//   element.childNodes.forEach((node) => {
//     if (node.nodeType === Node.TEXT_NODE) {
//       console.debug(`printDOM:Node.TEXT_NODE`, node.nodeName, JSON.stringify(node.textContent));
//     } else if (node.nodeType === Node.ELEMENT_NODE) {
//       console.debug(`printDOM:Node.ELEMENT_NODE`, node.nodeName);
//       printDOM(node as HTMLElement, level + 1);
//     } else {
//       console.debug(`printDOM:ELSE`, node.nodeName);
//     }
//   });
// }

// export function inspectCaret(editable: HTMLElement): HTMLElement {
//   // Clone DOM
//   const clone = editable.cloneNode(true) as HTMLElement;

//   const selection = window.getSelection();
//   if (!selection?.rangeCount) {
//     return clone;
//   }

//   const range = selection.getRangeAt(0);
//   if (!editable.contains(range.startContainer)) {
//     return clone;
//   }

//   // Build path to caret
//   const path: number[] = [];
//   let node: Node | null = range.startContainer;

//   while (node && node !== editable) {
//     const parent = node.parentNode as ParentNode;
//     if (!parent) break;
//     path.unshift(Array.prototype.indexOf.call(parent.childNodes, node));
//     node = parent;
//   }

//   // Resolve caret container in clone
//   let target: Node = clone;
//   for (const index of path) {
//     target = target.childNodes[index];
//   }

//   // Insert marker
//   const caret = document.createTextNode("|");

//   if (target.nodeType === Node.TEXT_NODE) {
//     const text = target as Text;
//     text.splitText(range.startOffset);
//     text.parentNode!.insertBefore(caret, text.nextSibling);
//   } else {
//     target.insertBefore(caret, target.childNodes[range.startOffset] || null);
//   }

//   return clone;
// }

// export function inspectDOM(element: HTMLElement): string {
//   const clone = element.cloneNode(true) as HTMLElement;

//   function walk(node: Node) {
//     node.childNodes.forEach((child) => {
//       if (child.nodeType === Node.TEXT_NODE) {
//         child.textContent = `<${child.textContent ?? ""}/>`;
//       } else {
//         walk(child);
//       }
//     });
//   }

//   walk(clone);
//   return clone.innerHTML.replace(/\n/g, "\\n").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
// }

// export function removeNonTextNodesFromDOM(element: HTMLElement) {
//   Array.from(element.childNodes).forEach((node) => {
//     if (node.nodeType !== Node.TEXT_NODE) {
//       element.removeChild(node);
//     }
//   });
// }

// export function getPlainTextWithNewlines(element: HTMLElement): string {
//   const BLOCK_TAGS = new Set(["DIV", "P", "LI", "SECTION", "ARTICLE", "HEADER", "FOOTER", "H1", "H2", "H3", "H4", "H5", "H6"]);
//   const lines: string[] = [];
//   let currentLine = "";

//   element.childNodes.forEach((node) => {
//     // console.debug(`getPlainTextWithNewlines ->`, node.nodeName, node.textContent?.replace(/\n/g, "\\n"));
//     if (node.nodeType === Node.TEXT_NODE) {
//       currentLine += node.textContent ?? "";
//     } else if (node.nodeType === Node.ELEMENT_NODE) {
//       const el = node as HTMLElement;
//       if (el.nodeName === "BR") {
//         lines.push(currentLine);
//         currentLine = "";
//       } else if (BLOCK_TAGS.has(el.nodeName)) {
//         // Flush current line if not empty
//         if (currentLine) {
//           lines.push(currentLine);
//           currentLine = "";
//         }
//         const inner = getPlainTextWithNewlines(el);
//         // Even if inner is empty, we want a blank line for empty block
//         lines.push(inner);
//       } else {
//         // Inline element: recurse but don't break line
//         currentLine += getPlainTextWithNewlines(el);
//       }
//     }
//   });

//   if (currentLine !== "" || lines.length === 0) {
//     lines.push(currentLine);
//   }

//   // Remove trailing blank lines
//   // while (lines.length > 1 && lines[lines.length - 1] === "") {
//   //   lines.pop();
//   // }

//   return lines.join("\n");
// }

// const cache = new Map<string, { value: any; expiration: number }>();
// export function memoizeWithTimeout<F extends (...args: any[]) => any>(fn: F, args: Parameters<F>, timeout = 30_000): ReturnType<F> {
//   const key = JSON.stringify([fn.toString(), args]);

//   const cached = cache.get(key);
//   if (cached && Date.now() < cached.expiration) {
//     return cached.value;
//   } else if (cached) {
//     cache.delete(key);
//   }

//   const result: ReturnType<F> = fn(...args);
//   cache.set(key, { value: result, expiration: Date.now() + timeout });

//   setTimeout(() => cache.delete(key), timeout);

//   return result;
// }

// export function throttle<T extends (...args: any[]) => any>(fn: T, delay: number): (...args: Parameters<T>) => void {
//   let lastCall = 0;
//   let timeoutId: ReturnType<typeof setTimeout> | null = null;
//   let lastArgs: Parameters<T> | null = null;
//   let lastThis: any;

//   return function throttled(this: any, ...args: Parameters<T>) {
//     const now = Date.now();
//     const remaining = delay - (now - lastCall);

//     lastArgs = args;
//     lastThis = this;

//     if (remaining <= 0) {
//       if (timeoutId) {
//         clearTimeout(timeoutId);
//         timeoutId = null;
//       }
//       lastCall = now;
//       fn.apply(lastThis, lastArgs);
//     } else if (!timeoutId) {
//       timeoutId = setTimeout(() => {
//         lastCall = Date.now();
//         timeoutId = null;
//         fn.apply(lastThis, lastArgs!);
//       }, remaining);
//     }
//   };
// }

// export function throttleWithRaf<T extends (...args: any[]) => void>(fn: T): (...args: Parameters<T>) => void {
//   let rafId: number | null = null;
//   let lastArgs: Parameters<T> | null = null;
//   let lastThis: any;

//   return function throttled(this: any, ...args: Parameters<T>) {
//     lastArgs = args;
//     lastThis = this;

//     if (rafId !== null) return;

//     rafId = requestAnimationFrame(() => {
//       rafId = null;
//       fn.apply(lastThis, lastArgs as Parameters<T>);
//     });
//   };
// }

// export function useDebouncedCallback<T extends (...args: any[]) => any>(fn: T, delay: number) {
//   const fnRef = useRef(fn);

//   const debouncedRef = useRef<
//     | (((...args: Parameters<T>) => void) & {
//         cancel: () => void;
//         flush: () => void;
//       })
//     | null
//   >(null);

//   // Keep latest fn (avoid stale closures)
//   useEffect(() => {
//     fnRef.current = fn;
//   }, [fn]);

//   if (!debouncedRef.current) {
//     debouncedRef.current = debounce((...args: Parameters<T>) => {
//       fnRef.current(...args);
//     }, delay);
//   }

//   // Cleanup on unmount
//   useEffect(() => {
//     return () => {
//       debouncedRef.current?.cancel();
//     };
//   }, []);

//   return debouncedRef.current;
// }

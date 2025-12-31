import { useEffect, useState } from "react";
import type { FlattenedNodeType, NodeDataType } from "../types";

export function debounce<T extends (...args: any[]) => void>(fn: T, delay: number): (...args: Parameters<T>) => void {
  let timerId: ReturnType<typeof setTimeout> | undefined;

  return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    if (timerId !== undefined) {
      clearTimeout(timerId);
    }

    timerId = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

export const ENGINE = {
  GECKO: typeof (window as any).InstallTrigger !== "undefined",
  BLINK: (window as any).chrome !== undefined,
};

export function genRandomToken(bytes = 32) {
  const array = new Uint8Array(bytes);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function useKeyboardOffset() {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (!window.visualViewport) return;

    const vv = window.visualViewport;

    const update = () => {
      const overlap = Math.max(0, window.innerHeight - (vv.height + vv.offsetTop));

      setOffset(overlap);
    };

    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);

    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, []);

  return offset;
}

export function arrayMove<T>(array: T[], from: number, to: number): T[] {
  const newArray = array.slice(); // shallow copy
  newArray.splice(
    to < 0 ? newArray.length + to : to, // target index
    0, // deleteCount = 0 (we're inserting)
    newArray.splice(from, 1)[0], // remove item at "from" and insert it here
  );
  return newArray;
}

export function arrayRelativeMove<T>(array: T[], item: T, relativeTo: T, offset: number): T[] {
  // ["A", "B", "C", "D", "E"]
  // For convenience when user pass -1 in reality it should be 0 as on move shift to right happens
  offset = offset < 0 ? offset + 1 : offset;
  const newArray = array.slice(); // shallow copy

  const itemIndex = newArray.indexOf(item);
  const refIndex = newArray.indexOf(relativeTo);
  if (itemIndex === -1 || refIndex === -1) return array;
  // remove item first
  const [removed] = newArray.splice(itemIndex, 1);

  const currentRefIndex = newArray.indexOf(relativeTo);
  // compute target index
  let targetIndex = currentRefIndex + offset;

  // clamp to array bounds
  targetIndex = Math.max(0, Math.min(targetIndex, newArray.length));

  newArray.splice(targetIndex, 0, removed);
  // console.debug(
  //   "arrayRelativeMove",
  //   {
  //     array: array,
  //     item: item,
  //     relativeTo: relativeTo,
  //     offset: offset,
  //     itemIndex: itemIndex,
  //     refIndex: refIndex,
  //     currentRefIndex: currentRefIndex,
  //     targetIndex: targetIndex,
  //   },
  //   newArray,
  // );

  return newArray;
}

export function generateFlattenedNodes(nodes: Map<string, NodeDataType>, rootNodeId: string, activeId: string) {
  if (!rootNodeId || !activeId) return [];

  const flattenedTree = flattenFromMap(nodes, rootNodeId);

  // Collect collapsed nodes
  const collapsedItems = flattenedTree.reduce<string[]>((accumulator, { children, collapsed, node_id }) => {
    if (collapsed && children.length) {
      accumulator.push(node_id);
    }
    return accumulator;
  }, []);

  // Hide children of collapsed nodes and of the active dragged node
  const flattenedNodes = removeChildrenOf(flattenedTree, activeId != null ? [activeId, ...collapsedItems] : collapsedItems);

  return flattenedNodes;
}

export function flattenTreeFromMap(nodes: Map<string, NodeDataType>, rootNodeId: string): FlattenedNodeType[] {
  return flattenFromMap(nodes, rootNodeId, null, 0);
}

export function flattenFromMap(nodes: Map<string, NodeDataType>, nodeId: string, parentId: string | null = null, depth = 0): FlattenedNodeType[] {
  const node = nodes.get(nodeId);
  if (!node) return [];

  // current node
  const current: FlattenedNodeType = {
    node_id: node.node_id,
    parent_id: parentId,
    depth,
    index: 0, // will be set by parent loop
    collapsed: node.collapsed,
    children: node.children,
  };

  // flatten children in order
  const childrenFlat = node.children.flatMap((childId, _) =>
    flattenFromMap(nodes, childId, node.node_id, depth + 1).map((item, i) => ({
      ...item,
      index: i,
    })),
  );

  return [current, ...childrenFlat];
}

// from dnd-kit
export function removeChildrenOf(items: FlattenedNodeType[], ids: string[]) {
  const excludeParentIds = [...ids];

  return items.filter((item) => {
    if (item.parent_id && excludeParentIds.includes(item.parent_id)) {
      if (item.children.length) {
        excludeParentIds.push(item.node_id);
      }
      return false;
    }

    return true;
  });
}

export function getProjection(items: FlattenedNodeType[], activeId: string, overId: string, dragOffset: number, indentOnOffset: number = 50) {
  const overItemIndex = items.findIndex((item: FlattenedNodeType) => item.node_id === overId);
  const activeItemIndex = items.findIndex((item: FlattenedNodeType) => item.node_id === activeId);
  if (overItemIndex === -1 || activeItemIndex === -1) return null;
  // const overItem = items[overItemIndex];
  // const activeItem = items[activeItemIndex];

  const newItems: FlattenedNodeType[] = arrayMove(items, activeItemIndex, overItemIndex);

  const newOverItemIndex = newItems.findIndex((item: FlattenedNodeType) => item.node_id === overId);
  const newActiveItemIndex = newItems.findIndex((item: FlattenedNodeType) => item.node_id === activeId);

  const shouldIndent = dragOffset > indentOnOffset ? 1 : 0;
  const position = newActiveItemIndex > newOverItemIndex ? "after" : "before";
  const placement = shouldIndent ? "indent" : position;

  return placement;
}

export function printDOM(element: HTMLElement, level = 0) {
  element.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      console.debug(`printDOM:Node.TEXT_NODE`, node.nodeName, JSON.stringify(node.textContent));
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      console.debug(`printDOM:Node.ELEMENT_NODE`, node.nodeName);
      printDOM(node as HTMLElement, level + 1);
    } else {
      console.debug(`printDOM:ELSE`, node.nodeName);
    }
  });
}

export function inspectCaret(editable: HTMLElement): HTMLElement {
  // Clone DOM
  const clone = editable.cloneNode(true) as HTMLElement;

  const selection = window.getSelection();
  if (!selection?.rangeCount) {
    return clone;
  }

  const range = selection.getRangeAt(0);
  if (!editable.contains(range.startContainer)) {
    return clone;
  }

  // Build path to caret
  const path: number[] = [];
  let node: Node | null = range.startContainer;

  while (node && node !== editable) {
    const parent = node.parentNode as ParentNode;
    if (!parent) break;
    path.unshift(Array.prototype.indexOf.call(parent.childNodes, node));
    node = parent;
  }

  // Resolve caret container in clone
  let target: Node = clone;
  for (const index of path) {
    target = target.childNodes[index];
  }

  // Insert marker
  const caret = document.createTextNode("|");

  if (target.nodeType === Node.TEXT_NODE) {
    const text = target as Text;
    text.splitText(range.startOffset);
    text.parentNode!.insertBefore(caret, text.nextSibling);
  } else {
    target.insertBefore(caret, target.childNodes[range.startOffset] || null);
  }

  return clone;
}

export function inspectDOM(element: HTMLElement): string {
  const clone = element.cloneNode(true) as HTMLElement;

  function walk(node: Node) {
    node.childNodes.forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        child.textContent = `<${child.textContent ?? ""}/>`;
      } else {
        walk(child);
      }
    });
  }

  walk(clone);
  return clone.innerHTML.replace(/\n/g, "\\n").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
}

export function removeNonTextNodesFromDOM(element: HTMLElement) {
  Array.from(element.childNodes).forEach((node) => {
    if (node.nodeType !== Node.TEXT_NODE) {
      element.removeChild(node);
    }
  });
}

export function getPlainTextWithNewlines(element: HTMLElement): string {
  const BLOCK_TAGS = new Set(["DIV", "P", "LI", "SECTION", "ARTICLE", "HEADER", "FOOTER", "H1", "H2", "H3", "H4", "H5", "H6"]);
  const lines: string[] = [];
  let currentLine = "";

  element.childNodes.forEach((node) => {
    // console.debug(`getPlainTextWithNewlines ->`, node.nodeName, node.textContent?.replace(/\n/g, "\\n"));
    if (node.nodeType === Node.TEXT_NODE) {
      currentLine += node.textContent ?? "";
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      if (el.nodeName === "BR") {
        lines.push(currentLine);
        currentLine = "";
      } else if (BLOCK_TAGS.has(el.nodeName)) {
        // Flush current line if not empty
        if (currentLine) {
          lines.push(currentLine);
          currentLine = "";
        }
        const inner = getPlainTextWithNewlines(el);
        // Even if inner is empty, we want a blank line for empty block
        lines.push(inner);
      } else {
        // Inline element: recurse but don't break line
        currentLine += getPlainTextWithNewlines(el);
      }
    }
  });

  if (currentLine !== "" || lines.length === 0) {
    lines.push(currentLine);
  }

  // Remove trailing blank lines
  // while (lines.length > 1 && lines[lines.length - 1] === "") {
  //   lines.pop();
  // }

  return lines.join("\n");
}

const cache = new Map<string, { value: any; expiration: number }>();
export function memoizeWithTimeout<F extends (...args: any[]) => any>(fn: F, args: Parameters<F>, timeout = 30_000): ReturnType<F> {
  const key = JSON.stringify([fn.toString(), args]);

  const cached = cache.get(key);
  if (cached && Date.now() < cached.expiration) {
    return cached.value;
  } else if (cached) {
    cache.delete(key);
  }

  const result: ReturnType<F> = fn(...args);
  cache.set(key, { value: result, expiration: Date.now() + timeout });

  setTimeout(() => cache.delete(key), timeout);

  return result;
}

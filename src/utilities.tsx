import type { FlattenedNodeType, NodeDataType } from "./types";

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
  console.debug(
    "arrayRelativeMove",
    {
      array: array,
      item: item,
      relativeTo: relativeTo,
      offset: offset,
      itemIndex: itemIndex,
      refIndex: refIndex,
      currentRefIndex: currentRefIndex,
      targetIndex: targetIndex,
    },
    newArray,
  );

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
  const logPrefix = `printDOM(${level})`;
  element.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      console.log(`${logPrefix} -> Node.TEXT_NODE`, node.nodeName, node.textContent?.replace(/\n/g, "\\n"));
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      console.log(`${logPrefix} -> Node.ELEMENT_NODE`, node.nodeName);
      printDOM(node as HTMLElement, level + 1);
    } else {
      console.log(`${logPrefix} -> ELSE`, node.nodeName);
    }
  });
}

export function getPlainTextWithNewlines(element: HTMLElement): string {
  const BLOCK_TAGS = new Set(["DIV", "P", "LI", "SECTION", "ARTICLE", "HEADER", "FOOTER", "H1", "H2", "H3", "H4", "H5", "H6"]);
  const lines: string[] = [];
  let currentLine = "";

  element.childNodes.forEach((node) => {
    console.debug(`getPlainTextWithNewlines ->`, node.nodeName, node.textContent?.replace(/\n/g, "\\n"));
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

// biome-ignore lint/suspicious/noExplicitAny: explanation
const cache = new Map<string, { value: any; expiration: number }>();
// @ts-ignore TS6133: declared but never read
// biome-ignore lint/suspicious/noExplicitAny: explanation
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

import { useSyncExternalStore, useMemo, useRef } from "react";

import type { YBlocksMap } from "esm-treero-api";

import type { FlatBlockT, BlockT } from "../../types/types.tsx";
import { removeChildrenOf } from "../../etc/utilities.tsx";

import * as Y from "yjs";

export function flattenBlocksTree(itemsMap: Record<string, BlockT>, rootId: string): FlatBlockT[] {
  const result: FlatBlockT[] = [];

  function flattener(id: string, depth: number) {
    const item = itemsMap[id];
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

export function useFlattenedTree(yblocks: YBlocksMap, rootId: string, activeId: string | null) {
  const tickRef = useRef(0);

  const version = useSyncExternalStore(
    (callback) => {
      function handleUpdate(events: any) {
        for (const event of events) {
          if (event.target instanceof Y.Text) {
          } else {
            tickRef.current++;
            console.debug("useFlattenedTree:handleUpdate:globalTick", tickRef.current);
            callback(); // Tell React to check the new version
          }
        }
      }

      yblocks.observeDeep(handleUpdate);
      return () => {
        yblocks.unobserveDeep(handleUpdate);
      };
    },
    () => tickRef.current,
  );

  // console.debug("useFlattenedTree:version", version);

  // 2. Compute the expensive flattened tree only when 'version' changes
  return useMemo(() => {
    // console.debug("useFlattenedTree:useMemo");
    const flattenedTree = flattenBlocksTree(yblocks.toJSON(), rootId);
    // const collapsedItemsIds = flattenedTree.reduce<string[]>(
    //   (acc, { children, collapsed, id }) => (collapsed && children?.length ? [...acc, id] : acc),
    //   [],
    // );
    const collapsedItemsIds = flattenedTree.filter(({ children, collapsed }) => collapsed && children?.length).map(({ id }) => id);
    // console.debug("collapsedItemsIds", collapsedItemsIds);
    return removeChildrenOf(flattenedTree, activeId != null ? [activeId, ...collapsedItemsIds] : collapsedItemsIds);
  }, [yblocks, rootId, activeId, version]);
}

import { useMemo, useRef, useSyncExternalStore } from "react";

import { flattenTree, removeChildrenOf } from "../utils/utilities.tsx";

import * as Y from "yjs";

export function useFlattenedTree<T>(yitems: Y.Map<T>, rootId: string, activeId: string | null) {
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

      yitems.observeDeep(handleUpdate);
      return () => {
        yitems.unobserveDeep(handleUpdate);
      };
    },
    () => tickRef.current,
  );

  // console.debug("useFlattenedTree:version", version);

  // 2. Compute the expensive flattened tree only when 'version' changes
  return useMemo(() => {
    // console.debug("useFlattenedTree:useMemo");
    const flattenedTree = flattenTree(yitems.toJSON(), rootId);
    const collapsedItemsIds = flattenedTree.filter(({ children, collapsed }) => collapsed && children?.length).map(({ id }) => id);
    return removeChildrenOf(flattenedTree, activeId != null ? [activeId, ...collapsedItemsIds] : collapsedItemsIds);
  }, [yitems, rootId, activeId, version]);
}

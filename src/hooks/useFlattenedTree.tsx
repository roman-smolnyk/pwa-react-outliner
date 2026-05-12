import { useMemo, useRef, useSyncExternalStore } from "react";

import { flattenTree, removeChildrenOf } from "../utils/utilities.tsx";

import * as Y from "yjs";

import { debounce } from "lodash";

export function useFlattenedTree<T>(yitems: Y.Map<T>, rootId: string, activeId: string | null) {
  const tickRef = useRef(0);

  const version = useSyncExternalStore(
    (callback) => {
      function update() {
        tickRef.current++;
        console.debug("useFlattenedTree:useSyncExternalStore:tickRef", tickRef.current);
        callback(); // Tell React to check the new version
      }
      const debouncedUpdate = debounce(update, 250);

      function observerCallback(events: any) {
        for (const event of events) {
          if (event.target instanceof Y.Text) {
            // console.debug("event", event);
            debouncedUpdate();
            // update();
          } else {
            update();
          }
        }
      }

      yitems.observeDeep(observerCallback);
      return () => {
        yitems.unobserveDeep(observerCallback);
      };
    },
    () => tickRef.current,
  );

  // console.debug("useFlattenedTree:version", version);

  // Compute the expensive flattened tree only when 'version' changes
  return useMemo(() => {
    console.debug("useFlattenedTree:useMemo:version", version);
    const flattenedTree = flattenTree(yitems.toJSON(), rootId);
    const collapsedItemsIds = flattenedTree.filter(({ children, collapsed }) => collapsed && children?.length).map(({ id }) => id);
    return removeChildrenOf(flattenedTree, activeId != null ? [activeId, ...collapsedItemsIds] : collapsedItemsIds);
  }, [yitems, rootId, activeId, version]);
}

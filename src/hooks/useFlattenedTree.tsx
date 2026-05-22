import type { YBlocksMap, YExplorerMap } from "esm-treero-api";
import { debounce } from "lodash";
import log from "loglevel";
import { useMemo, useRef, useSyncExternalStore } from "react";
import * as Y from "yjs";
import useZustandStore from "../store/useZustandStore.tsx";
import { flattenAndFilterYTree } from "../utils/utilities.tsx";

export function useFlattenedTree<T extends YBlocksMap | YExplorerMap>(
  yitems: T,
  rootId: string,
  collapse: boolean,
  activeId: string | null,
  customTicker?: number,
) {
  const tickRef = useRef(0);

  const version = useSyncExternalStore(
    (callback) => {
      function update() {
        tickRef.current++;
        log.debug("useFlattenedTree:useSyncExternalStore:tickRef", tickRef.current);
        callback(); // Tell React to check the new version
      }
      const debouncedUpdate = debounce(update, 500);

      function observerCallback(events: any) {
        for (const event of events) {
          if (event.target instanceof Y.Text) {
            // log.debug("event", event);
            if (useZustandStore.getState().selectedBlockId) {
              debouncedUpdate();
              // update();
            } else {
              update();
            }
          } else {
            update();
          }
        }
      }

      yitems.observeDeep(observerCallback);
      return () => {
        debouncedUpdate.cancel();
        yitems.unobserveDeep(observerCallback);
      };
    },
    () => tickRef.current,
  );

  // Compute the expensive flattened tree only when 'version' changes
  return useMemo(() => {
    log.debug("useFlattenedTree:useMemo", version, customTicker, rootId, activeId);
    // performance.mark("start");

    const result = flattenAndFilterYTree(yitems, rootId, collapse, activeId);

    // performance.mark("end");
    // performance.measure("flattenTree", "start", "end");
    // log.debug("PERF", performance.getEntriesByName("flattenTree").slice(-1)[0]);
    return result;
  }, [version, yitems, rootId, collapse, activeId, customTicker]);
}

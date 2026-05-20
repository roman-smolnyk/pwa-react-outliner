import type { DragEndEvent, DragMoveEvent, DragStartEvent } from "@dnd-kit/core";
import { closestCenter, DndContext, DragOverlay, MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy, type SortingStrategy } from "@dnd-kit/sortable";
import { getItem, moveItem } from "esm-treero-api";
import log from 'loglevel';
import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { INDENT } from "../../../config.tsx";
import { useFlattenedTree } from "../../hooks/useFlattenedTree.tsx";
import useZustandStore from "../../store/useZustandStore.tsx";
import yjs from "../../store/yjsManager.tsx";
import type { FlatBlocksT, FlatBlockT } from "../../types/types.tsx";
import { getProjection } from "../../utils/utilities.tsx";
import Block from "../Block/Block.tsx";
import PageSearch from "./PageSearch.tsx";

// const adjustTranslate: Modifier = ({ transform }) => {
//   return {
//     ...transform,
//     x: transform.x,
//     y: transform.y,
//   };
// };

const sortingStrategy: SortingStrategy = (args) => {
  if (args.overIndex === 0) args.overIndex = 1;
  return verticalListSortingStrategy(args);
};

// const Page = memo(({ rootId }: { rootId: string }) => {
export default function Page({ rootId }: { rootId: string }) {
  log.debug("Page");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [dragOffsetX, setDragOffsetX] = useState(0);

  const renderPageTicker = useZustandStore((s) => s.renderPageTicker);
  const isPageSearchActive = useZustandStore((s) => s.isPageSearchActive);
  const checkedBlockIds = useZustandStore((s) => s.checkedBlockIds);

  const flatItems = useFlattenedTree(yjs.yblocks, rootId, activeId, renderPageTicker, isPageSearchActive) as FlatBlocksT;
  // log.debug("flatItems", flatItems);
  const flatItemIds = useMemo(() => flatItems.map((a) => a.id), [flatItems]);

  const projected = activeId && overId ? getProjection(flatItems, activeId, overId, dragOffsetX, INDENT) : null;

  const sensors = useSensors(
    // useSensor(PointerSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(MouseSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragMove(event: DragMoveEvent) {
    // log.debug("handleDragMove:delta.x", event.delta.x);
    setDragOffsetX(event.delta.x);
    if (event.over?.id) {
      setOverId(event.over.id as string);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    // log.debug("handleDragEnd", event.active.id, event.over?.id, projected);
    // && event.active.id !== event.over.id
    if (event.active.id && event.over?.id && projected) {
      const parentId = projected.parentId ?? rootId;
      const clonedItems: FlatBlockT[] = structuredClone(flatItems);
      const overIndex = clonedItems.findIndex(({ id }) => id === event.over?.id);
      const activeIndex = clonedItems.findIndex(({ id }) => id === event.active.id);
      const activeTreeItem = clonedItems[activeIndex];
      const updatedItem = { ...activeTreeItem, depth: projected.depth, parent_id: parentId };
      clonedItems[activeIndex] = updatedItem;
      const sortedItems = arrayMove(clonedItems, activeIndex, overIndex);

      const siblings = sortedItems.filter((item) => item.parent_id === parentId);
      const indexInParent = siblings.findIndex((item) => item.id === event.active.id);
      // log.debug("MOVE", { id: event.active.id, parentId: parentId, index: indexInParent });
      moveItem(yjs.ydoc, yjs.yblocks, event.active.id as string, parentId, indexInParent);
      getItem(yjs.yblocks, parentId).set("collapsed", false);
    }
    setActiveId(null);
    setOverId(null);
    setDragOffsetX(0);
  }

  return (
    <div className="Page flex flex-col">
      {isPageSearchActive && createPortal(<PageSearch />, document.getElementById("root")!)}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter} // rectIntersection
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
        // autoScroll={false}
      >
        <SortableContext items={flatItemIds} strategy={sortingStrategy}>
          {flatItems.map((item) => {
            return (
              <Block
                key={item.id}
                id={item.id}
                collapsed={item.collapsed}
                childrenLength={item.children.length}
                depth={item.id === activeId && projected ? projected.depth : item.depth}
                isRoot={item.id === rootId}
                isActive={item.id === activeId}
                isChecked={checkedBlockIds.includes(item.id)}
              />
            );
          })}
        </SortableContext>

        {createPortal(
          <DragOverlay>
            {activeId ? (
              <div className="cursor-grabbing w-full h-5"></div>
              // <div className="DragOverlay inline-block cursor-grabbing pl-5">
              //   <div className="border border-black bg-background px-1">Move</div>
              // </div>
            ) : null}
          </DragOverlay>,
          document.body,
        )}
      </DndContext>
    </div>
  );
}
// export default Page;

import type { DragEndEvent, DragMoveEvent, DragStartEvent } from "@dnd-kit/core";
import { closestCenter, DndContext, DragOverlay, MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy, type SortingStrategy } from "@dnd-kit/sortable";
import log from "loglevel";
import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { INDENT } from "../../../config.tsx";
import { handleBlockMove } from "../../api/api.tsx";
import { useFlattenedTree } from "../../hooks/useFlattenedTree.tsx";
import useStore from "../../store/useStore.tsx";
import yjs from "../../store/yjsManager.tsx";
import type { FlatBlocksT } from "../../types/types.tsx";
import { getProjection } from "../../utils/utilities.ts";
import Block from "../Block/Block.tsx";
import CheckboxSelectionToolbar from "./CheckboxSelectionToolbar.tsx";
import PageSearchToolbar from "./PageSearchToolbar.tsx";

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

export default function Page({ rootId }: { rootId: string }) {
  log.debug("Page");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [dragOffsetX, setDragOffsetX] = useState(0);

  const renderPageTicker = useStore((s) => s.renderPageTicker);
  const isPageSearchActive = useStore((s) => s.isPageSearchActive);
  const isCheckboxSelectionActive = useStore((s) => s.isCheckboxSelectionActive);
  const checkedBlockIds = useStore((s) => s.checkedBlockIds);
  // log.debug("checkedBlockIds", checkedBlockIds);

  const flatItems = useFlattenedTree(yjs.yblocks, rootId, !isPageSearchActive, activeId, renderPageTicker) as FlatBlocksT;
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
      // log.debug("flatItems", flatItems);
      const clonedItems = structuredClone(flatItems);
      const overIndex = clonedItems.findIndex(({ id }) => id === event.over?.id);
      const activeIndex = clonedItems.findIndex(({ id }) => id === event.active.id);
      const activeTreeItem = clonedItems[activeIndex];
      const updatedItem = { ...activeTreeItem, depth: projected.depth, parent_id: parentId };
      clonedItems[activeIndex] = updatedItem;
      const sortedItems = arrayMove(clonedItems, activeIndex, overIndex);

      const siblings = sortedItems.filter((item) => item.parent_id === parentId);
      const indexInParent = siblings.findIndex((item) => item.id === event.active.id);
      log.debug("MOVE", { id: event.active.id, parentId: parentId, index: indexInParent });
      handleBlockMove(event.active.id as string, parentId, indexInParent);
    }
    setActiveId(null);
    setOverId(null);
    setDragOffsetX(0);
  }

  return (
    <div className="Page flex flex-col">
      {isPageSearchActive && createPortal(<PageSearchToolbar />, document.getElementById("root")!)}
      {isCheckboxSelectionActive && createPortal(<CheckboxSelectionToolbar />, document.getElementById("root")!)}
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
                content={item.content}
                collapsed={item.collapsed}
                childrenLength={item.children.length}
                depth={item.id === activeId && projected ? projected.depth : item.depth}
                isRoot={item.id === rootId}
                isActive={item.id === activeId}
                isChecked={checkedBlockIds.has(item.id)}
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

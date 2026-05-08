import type { DragEndEvent, DragMoveEvent, DragStartEvent } from "@dnd-kit/core";
import { closestCenter, DndContext, DragOverlay, MouseSensor, TouchSensor, useSensor, useSensors, type Modifier } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy, type SortingStrategy } from "@dnd-kit/sortable";
import { useState } from "react";
import { createPortal } from "react-dom";
// import { Virtuoso } from "react-virtuoso";

import type { FlatBlockT } from "../../types/types.tsx";

import { getProjection } from "../../etc/utilities.tsx";
import yjs from "../../store/yjsManager.tsx";
import Block from "../Block/Block.tsx";
import { useFlattenedTree } from "./useFlattenedTree.tsx";
import { move } from "esm-treero-api";
import { INDENT } from "../../../config.tsx";

const adjustTranslate: Modifier = ({ transform }) => {
  return {
    ...transform,
    x: transform.x,
    y: transform.y,
  };
};

export default function Page({ rootId }: { rootId: string }) {
  // console.debug("Page");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [dragOffsetX, setDragOffsetX] = useState(0);

  const flatItems: FlatBlockT[] = useFlattenedTree(yjs.yblocks, rootId, activeId);
  // console.debug("flatItems", flatItems);

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
    // console.debug("handleDragMove:delta.x", event.delta.x);
    setDragOffsetX(event.delta.x);
    if (event.over?.id) {
      setOverId(event.over.id as string);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    console.debug("handleDragEnd", event.active.id, event.over?.id, projected);
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
      console.debug("MOVE", { id: event.active.id, parentId: parentId, index: indexInParent });
      move(yjs.ydoc, yjs.yblocks, event.active.id as string, parentId, indexInParent);
    }
    setActiveId(null);
    setOverId(null);
    setDragOffsetX(0);
  }

  const sortingStrategy: SortingStrategy = (args) => {
    if (args.overIndex === 0) args.overIndex = 1;
    return verticalListSortingStrategy(args);
  };

  return (
    <div className="Page flex flex-col gap-1">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter} // rectIntersection
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
        // autoScroll={false}
      >
        <SortableContext items={flatItems.map((a) => a.id)} strategy={sortingStrategy}>
          {/* <Virtuoso
            // style={{ height: 400 }}
            totalCount={flatItems.length}
            overscan={50}
            itemContent={(index) => {
              const fItem = flatItems[index];
              return (
                <Block
                  key={fItem.id}
                  id={fItem.id}
                  collapsed={fItem.collapsed}
                  children_={fItem.children}
                  depth={fItem.depth}
                  isRoot={fItem.id === rootId}
                  isActive={fItem.id === activeId}
                  isOver={fItem.id === parentId}
                  projectedDepth={projection?.depth}
                />
              );
            }}
          /> */}

          {flatItems.map((item) => {
            return (
              <Block
                key={item.id}
                id={item.id}
                collapsed={item.collapsed}
                children_={item.children}
                depth={item.id === activeId && projected ? projected.depth : item.depth}
                isRoot={item.id === rootId}
                isActive={item.id === activeId}
              />
            );
          })}
        </SortableContext>

        {createPortal(
          <DragOverlay modifiers={[adjustTranslate]}>
            {activeId ? (
              <div className="DragOverlay inline-block cursor-grabbing pl-5">
                <div className="border border-black bg-white px-1">Move</div>
              </div>
            ) : null}
          </DragOverlay>,
          document.body,
        )}
      </DndContext>
    </div>
  );
}

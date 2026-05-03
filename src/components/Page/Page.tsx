import type { DragMoveEvent, DragStartEvent } from "@dnd-kit/core";
import {
  closestCenter,
  DndContext,
  DragOverlay,
  MouseSensor,
  rectIntersection,
  TouchSensor,
  useSensor,
  useSensors,
  type Modifier,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { useState } from "react";
import { createPortal } from "react-dom";
import { Virtuoso } from "react-virtuoso";

import type { FlatBlockT } from "../../types/types.tsx";

import yjs from "../../store/yjsManager.tsx";
import Block from "../Block/Block.tsx";
import { useFlattenedTree } from "./useFlattenedTree.tsx";
import { getProjection } from "../../etc/utilities.tsx";
import { INDENT } from "../../config/appConfig.tsx";

export default function Page({ rootId }: { rootId: string }) {
  // console.debug("Page");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [dragOffsetX, setDragOffsetX] = useState(0);

  // const blocks = useStore((state) => state.blocks);

  const flatItems: FlatBlockT[] = useFlattenedTree(yjs.yblocks, rootId, activeId);

  const projection = activeId && overId ? getProjection(flatItems, activeId, overId, dragOffsetX, INDENT) : null;

  const { parentId } = projection || {};

  // console.debug("flatItems", flatItems);

  const sensors = useSensors(
    // useSensor(PointerSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(MouseSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
    // document.body.style.setProperty("cursor", "grabbing");
  }

  function handleDragMove(event: DragMoveEvent) {
    console.debug("delta.x", event.delta.x);
    setDragOffsetX(event.delta.x);
    if (event.over?.id) {
      setOverId(event.over.id as string);
      console.debug("handleDragMove", projection);

      const oldIndex = flatItems.findIndex((i) => i.id === event.active.id);
      const newIndex = flatItems.findIndex((i) => i.id === event.over?.id);
      if (newIndex === 0) return;

      // This moves the "Placeholder/Ghost" inside the virtual list
      // setFlatItems(arrayMove(flatItems, oldIndex, newIndex));
    }
  }

  function handleDragEnd(event: any) {
    const { active, over } = event;
    if (active.id !== over?.id) {
      // const projection = getProjection(flatItems, active.id, over?.id, dragOffsetX, INDENT);
      console.debug("handleDragEnd", projection);
      // const oldIndex = flatItems.findIndex((a) => a.id === active.id);
      // const newIndex = flatItems.findIndex((a) => a.id === over?.id);
      // setFlatItems(arrayMove(flatItems, oldIndex, newIndex));
      if (!projection) return;

      const { depth, parentId } = projection;

      const clonedItems: FlatBlockT[] = structuredClone(flatItems);

      const overIndex = clonedItems.findIndex(({ id }) => id === over.id);
      const activeIndex = clonedItems.findIndex(({ id }) => id === active.id);
      const activeTreeItem = clonedItems[activeIndex];

      const updatedItem = { ...activeTreeItem, depth, parent_id: parentId };
      clonedItems[activeIndex] = updatedItem;

      const sortedItems = arrayMove(clonedItems, activeIndex, overIndex);

      // 4. FIND THE NEW INDEX AMONG SIBLINGS
      // Filter the list to find only items that share the same new parent
      const siblings = sortedItems.filter((item) => item.parent_id === parentId);
      const indexInParent = siblings.findIndex((item) => item.id === active.id);
      console.debug(parentId, indexInParent);
    }
    setActiveId(null);
    setOverId(null);
    // document.body.style.setProperty("cursor", "");
  }

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
        <SortableContext
          items={flatItems.map((a) => a.id)}
          strategy={(args) => {
            console.debug("args", args);
            if (args.overIndex === 0) {
              args.overIndex = 1;
            }
            const result = verticalListSortingStrategy(args);

            return result;
          }}
        >
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
                depth={item.depth}
                isRoot={item.id === rootId}
                isActive={item.id === activeId}
                isOver={item.id === parentId}
                projectedDepth={projection?.depth}
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

const adjustTranslate: Modifier = ({ transform }) => {
  return {
    ...transform,
    x: transform.x,
    y: transform.y,
  };
};

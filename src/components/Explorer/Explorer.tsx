import type { DragEndEvent, DragMoveEvent, DragStartEvent } from "@dnd-kit/core";
import { closestCenter, DndContext, DragOverlay, MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { getItem, getPageByBlockId, moveItem, type YExpEntryMap } from "esm-treero-api";
import log from "loglevel";
import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { INDENT } from "../../../config.tsx";
import { useFlattenedTree } from "../../hooks/useFlattenedTree.tsx";
import useStore from "../../store/useStore.tsx";
import yjs from "../../store/yjsManager.tsx";
import type { FlatExplorerT } from "../../types/types.tsx";
import { getProjection } from "../../utils/utilities.tsx";
import ExpEntry from "./ExpEntry.tsx";

export default function Explorer({ rootId }: { rootId: string }) {
  log.debug("Explorer");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [dragOffsetX, setDragOffsetX] = useState(0);

  const rootBlockId = useStore((s) => s.rootBlockId);

  let ypage: YExpEntryMap;
  try {
    ypage = getPageByBlockId(yjs.ydoc, rootBlockId);
  } catch {}

  const sensors = useSensors(
    // useSensor(PointerSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(MouseSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
  );

  let flatItems = useFlattenedTree(yjs.yexplorer, rootId, true, activeId) as FlatExplorerT;
  flatItems = flatItems.slice(1); // Remove root
  // log.debug("flatItems", flatItems);
  const flatItemIds = useMemo(() => flatItems.map((a) => a.id), [flatItems]);

  const projected = activeId && overId ? getProjection(flatItems, activeId, overId, dragOffsetX, INDENT) : null;

  // log.debug("projected", projected);

  if (projected?.parentId) {
    const yitem = yjs.yexplorer.get(projected.parentId);
    if (yitem && yitem.get("type") === 1) {
      const x = flatItems.find((a) => a.id === projected.parentId)!;
      projected.depth = x.depth;
      projected.parentId = yitem.get("parent_id");
    }
  }

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
      const clonedItems: FlatExplorerT = structuredClone(flatItems);
      const overIndex = clonedItems.findIndex(({ id }) => id === event.over?.id);
      const activeIndex = clonedItems.findIndex(({ id }) => id === event.active.id);
      const activeTreeItem = clonedItems[activeIndex];
      const updatedItem = { ...activeTreeItem, depth: projected.depth, parent_id: parentId };
      clonedItems[activeIndex] = updatedItem;
      const sortedItems = arrayMove(clonedItems, activeIndex, overIndex);

      const siblings = sortedItems.filter((item) => item.parent_id === parentId);
      const indexInParent = siblings.findIndex((item) => item.id === event.active.id);
      // log.debug("MOVE", { id: event.active.id, parentId: parentId, index: indexInParent });
      moveItem(yjs.ydoc, yjs.yexplorer, event.active.id as string, parentId, indexInParent);
      getItem(yjs.yexplorer, parentId).set("collapsed", false);
    }
    setActiveId(null);
    setOverId(null);
    setDragOffsetX(0);
  }

  return (
    <div className={`Explorer relative z-0 flex flex-col gap-0`}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter} // rectIntersection
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
        // autoScroll={false}
      >
        <SortableContext items={flatItemIds} strategy={verticalListSortingStrategy}>
          {flatItems.map((item) => {
            return (
              <ExpEntry
                key={item.id}
                id={item.id}
                type={item.type}
                title={item.title}
                collapsed={item.collapsed}
                childrenLength={item.children ? item.children.length : undefined}
                depth={item.id === activeId && projected ? projected.depth : item.depth}
                isActive={item.id === activeId}
                isSelected={item.id === ypage?.get("id")}
              />
            );
          })}
        </SortableContext>

        {createPortal(
          <DragOverlay>
            {activeId ? (
              <div className="cursor-grabbing w-full h-5"></div>
              // <div className="DragOverlay inline-block cursor-grabbing" style={{ paddingLeft: `${(projected?.depth ?? 0) + 1 * INDENT}px` }}>
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

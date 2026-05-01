import type { DragMoveEvent, DragStartEvent } from "@dnd-kit/core";
import { closestCenter, DndContext, DragOverlay, MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useState } from "react";
import { Virtuoso } from "react-virtuoso";

import type { FlatBlockT } from "../../types/types.tsx";

import yjs from "../../store/yjsManager.tsx";
import Block from "../Block/Block.tsx";
import { useFlattenedTree } from "./useFlattenedTree.tsx";
import { getProjection } from "../../etc/utilities.tsx";
import { INDENT } from "../../config/appConfig.tsx";

export default function Page({ rootId }: { rootId: string }) {
  console.debug("Page");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [dragOffsetX, setDragOffsetX] = useState(0);

  // const blocks = useStore((state) => state.blocks);

  const flatItems: FlatBlockT[] = useFlattenedTree(yjs.yblocks, rootId, activeId);

  console.debug("flatItems", flatItems);

  const sensors = useSensors(
    // useSensor(PointerSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(MouseSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragMove(event: DragMoveEvent) {
    console.debug("delta.x", event.delta.x);
    setDragOffsetX(event.delta.x);
  }

  function handleDragEnd(event: any) {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const projection = getProjection(flatItems, active.id, over?.id, dragOffsetX, INDENT);
      console.debug("handleDragEnd", projection);
      // const oldIndex = flatItems.findIndex((a) => a.id === active.id);
      // const newIndex = flatItems.findIndex((a) => a.id === over?.id);
      // setFlatItems(arrayMove(flatItems, oldIndex, newIndex));
    }
    setActiveId(null);
  }

  return (
    <div className="w-full h-full">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={flatItems.map((a) => a.id)} strategy={() => null}>
          <Virtuoso
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
                  index={index}
                  isRoot={fItem.id === rootId}
                />
              );
            }}
          />
        </SortableContext>

        <DragOverlay>{activeId ? <div>Move</div> : null}</DragOverlay>
      </DndContext>
    </div>
  );
}

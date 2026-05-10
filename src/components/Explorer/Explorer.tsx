import { useSortable } from "@dnd-kit/sortable";
import {
  FilePlusIcon,
  FileTextIcon,
  FolderDownIcon,
  FolderIcon,
  FolderInputIcon,
  FolderPlusIcon,
  PanelLeftCloseIcon,
  SearchIcon,
} from "lucide-react";
import { memo, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../Common/Button.tsx";
import PlainMarkdown from "../Markdown/PlainMarkdown";
import useZustandStore from "../../store/useZustandStore";

import type { DragEndEvent, DragMoveEvent, DragStartEvent } from "@dnd-kit/core";
import { closestCenter, DndContext, DragOverlay, MouseSensor, TouchSensor, useSensor, useSensors, type Modifier } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy, type SortingStrategy } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
// import { Virtuoso } from "react-virtuoso";

import type { FlatBlockT, FlatExplorerT } from "../../types/types.tsx";

import { getProjection } from "../../utils/utilities.tsx";
import yjs from "../../store/yjsManager.tsx";
import Block from "../Block/Block.tsx";
import { getItem, getPageByRootBlockId, moveItem } from "esm-treero-api";
import { INDENT } from "../../../config.tsx";

import { CSS as DnDCSS } from "@dnd-kit/utilities";

import { EllipsisVerticalIcon, MinusIcon, PlusCircleIcon, DotIcon, CircleIcon, CircleMinusIcon } from "lucide-react";
import { useFlattenedTree } from "../../hooks/useFlattenedTree.tsx";
import ExpEntry from "./ExpEntry.tsx";

export default function Explorer({ rootId }: { rootId: string }) {
  console.debug("Explorer");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [dragOffsetX, setDragOffsetX] = useState(0);

  const rootBlockId = useZustandStore((state) => state.rootBlockId);
  const ypage = getPageByRootBlockId(yjs.ydoc, rootBlockId);

  const sensors = useSensors(
    // useSensor(PointerSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(MouseSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
  );

  // @ts-ignore
  let flatItems = useFlattenedTree(yjs.yexplorer, rootId, activeId) as FlatExplorerT;
  flatItems = flatItems.slice(1); // Remove root
  // console.debug("flatItems", flatItems);

  const projected = activeId && overId ? getProjection(flatItems, activeId, overId, dragOffsetX, INDENT) : null;

  console.debug("projected", projected);

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
      const clonedItems: FlatExplorerT = structuredClone(flatItems);
      const overIndex = clonedItems.findIndex(({ id }) => id === event.over?.id);
      const activeIndex = clonedItems.findIndex(({ id }) => id === event.active.id);
      const activeTreeItem = clonedItems[activeIndex];
      const updatedItem = { ...activeTreeItem, depth: projected.depth, parent_id: parentId };
      clonedItems[activeIndex] = updatedItem;
      const sortedItems = arrayMove(clonedItems, activeIndex, overIndex);

      const siblings = sortedItems.filter((item) => item.parent_id === parentId);
      const indexInParent = siblings.findIndex((item) => item.id === event.active.id);
      console.debug("MOVE", { id: event.active.id, parentId: parentId, index: indexInParent });
      moveItem(yjs.ydoc, yjs.yexplorer, event.active.id as string, parentId, indexInParent);
    }
    setActiveId(null);
    setOverId(null);
    setDragOffsetX(0);
  }

  const sortingStrategy: SortingStrategy = (args) => {
    // if (args.overIndex === 0) args.overIndex = 1;
    return verticalListSortingStrategy(args);
  };

  return (
    <div className={`Explorer relative z-0 flex flex-col gap-1`}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter} // rectIntersection
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
        // autoScroll={false}
      >
        <SortableContext items={flatItems.map((a) => a.id)} strategy={sortingStrategy}>
          {flatItems.map((item) => {
            return (
              <ExpEntry
                key={item.id}
                id={item.id}
                type={item.type}
                title={item.title}
                collapsed={item.collapsed}
                children_={item.children}
                depth={item.id === activeId && projected ? projected.depth : item.depth}
                isRoot={item.id === rootId}
                isActive={item.id === activeId}
                isSelected={item.id === ypage?.get("id")}
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

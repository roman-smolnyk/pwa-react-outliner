import type { DragEndEvent, DragMoveEvent, DragOverEvent, DragStartEvent } from "@dnd-kit/core";
import { DndContext, MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { TraversalOrder } from "@dnd-kit/core";

export function DnDWrapperComponent({
  children,
  onDragStart,
  onDragOver,
  onDragMoveCallback,
  onDragEnd,
}: {
  children: React.ReactNode;
  onDragStart?: (e: DragStartEvent) => void;
  onDragOver?: (e: DragOverEvent) => void;
  onDragMoveCallback?: (
    e: DragMoveEvent,
    dndCoordinates: {
      pointerX: number;
      pointerY: number;
      pageX: number;
      pageY: number;
      clientX: number;
      clientY: number;
      scrollX: number;
      scrollY: number;
    },
  ) => void;
  onDragEnd?: (e: DragEndEvent) => void;
}) {
  //
  const sensors = useSensors(
    // useSensor(PointerSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(MouseSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
  );

  return (
    <DndContext
      sensors={sensors}
      // collisionDetection={closestCenter}
      autoScroll={{ order: TraversalOrder.ReversedTreeOrder }}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragMove={(event) => {
        // console.debug("onDragMove", event);

        if (!event.over) return;

        let pointerX = 0,
          pointerY = 0,
          pageX = 0,
          pageY = 0,
          clientX = 0,
          clientY = 0,
          scrollX = 0,
          scrollY = 0;

        const activatorEvent = event.activatorEvent;
        if (activatorEvent instanceof MouseEvent) {
          clientX = activatorEvent.clientX;
          clientY = activatorEvent.clientY;
          pageX = activatorEvent.pageX;
          pageY = activatorEvent.pageY;
          pointerX = pageX + event.delta.x;
          pointerY = pageY + event.delta.y;
        } else if (activatorEvent instanceof TouchEvent && activatorEvent.touches.length > 0) {
          const touch = activatorEvent.touches[0];
          clientX = touch.clientX;
          clientY = touch.clientY;
          pageX = touch.pageX;
          pageY = touch.pageY;
          pointerX = pageX + event.delta.x;
          pointerY = pageY + event.delta.y;
        } else {
          throw new Error("Invalid DragNDrop sensor used");
        }

        scrollX = window.pageXOffset || document.documentElement.scrollLeft;
        scrollY = window.pageYOffset || document.documentElement.scrollTop;

        const dndCoordinates = {
          pointerX: pointerX,
          pointerY: pointerY,
          pageX: pageX,
          pageY: pageY,
          clientX: clientX,
          clientY: clientY,
          scrollX: scrollX,
          scrollY: scrollY,
        };

        // console.debug(dndCoordinates);

        if (onDragMoveCallback) onDragMoveCallback(event, dndCoordinates);
      }}
      onDragEnd={onDragEnd}
    >
      {children}
    </DndContext>
  );
}

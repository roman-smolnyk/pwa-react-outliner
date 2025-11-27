// import { EllipsisVertical, Minus, PlusCircle } from "lucide-react";
// import { PlusCircle } from "@phosphor-icons/react";
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import { TreeRoAPI } from "../api";
import { NodeComponent, NodeContentComponent } from "../components/nodeComp";
import { useStore, useUIStore } from "../stateStore";

export default function DocumentComponent() {
  const _logPrefix = `DocumentComponent`;

  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    TreeRoAPI.loadInitialData();
  }, []);

  const currentDocId = useStore((state) => state.currentDocId);

  const rootNode = useStore((state) => {
    if (!state.currentDocId) return null;
    const rootNodeId = state.getDocumentRootNodeId(state.currentDocId);
    if (!rootNodeId) return null;
    return state.nodes.get(rootNodeId);
  });

  // const nodes = useStore.getState().nodes;
  // const rootNodeId = rootNode?.node_id;

  // console.debug(`${logPrefix} -> meta`, stateIsInitialized, currentDocId);
  // console.debug(`${logPrefix} -> rootNode`, rootNode);

  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: {
      delay: 250, // Minimum time (in milliseconds) the pointer must be pressed before the drag activates.
      tolerance: 10, // Maximum movement (in pixels) allowed during the delay period. Prevents interrupt on mobile screens
      distance: 5, // Minimum distance (in pixels) the pointer must move before the drag activates.
    },
  });

  const sensors = useSensors(pointerSensor);

  if (!rootNode) return null;

  // const handleClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
  //   const target = e.target as HTMLElement;
  //   const bullet = target.closest<HTMLButtonElement>(".Node-bullet");
  // };

  const childNodes = TreeRoAPI.getNodeChildren(rootNode?.node_id || "");

  // console.debug(`${logPrefix} -> childNodes`, childNodes);

  return (
    <DndContext
      // collisionDetection={closestCenter}
      sensors={sensors}
      // collisionDetection={closestCenter}
      onDragStart={(event) => {
        // console.log("onDragStart", event);
        setActiveId(event.active.id as string);
        // const el = document.getElementById(`${event.active.id}`)!;
        // el.classList.add("bg-gray-200");
      }}
      onDragMove={(event) => {
        // console.debug("onDragMove", event);
        const activatorEvent = event.activatorEvent as PointerEvent;
        const pointerX = activatorEvent.pageX + event.delta.x;
        const pointerY = activatorEvent.pageY + event.delta.y;
        if (event.over) {
          // const rect = event.over.rect;
          const el = document.querySelector(`.Node-self[data-id="${event.over.id}"]`)!;
          const rect = el.getBoundingClientRect();

          const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
          const scrollY = window.pageYOffset || document.documentElement.scrollTop;

          const rectPageTop = rect.top + scrollY;
          // const rectPageBottom = rect.bottom + scrollY;

          const middleX = 200;
          const middleY = rectPageTop + rect.height / 2;
          const offsetFromLeft = pointerX - (rect.left + scrollX);
          // console.debug({
          //   offsetFromLeft: offsetFromLeft,
          //   middleY: middleY,
          //   pointerY: pointerY,
          //   pageY: activatorEvent.pageY,
          //   clientY: activatorEvent.clientY,
          //   pageX: activatorEvent.pageX,
          //   clientX: activatorEvent.clientX,
          // });
          const shouldIndent = offsetFromLeft > middleX;
          const position = pointerY > middleY ? "below" : "above";
          const placement = shouldIndent && position === "below" ? "inside" : position;
          // console.debug("placement", placement);

          const descendantsIds = TreeRoAPI.getNodeDescendantsIds(event.active.id as string);

          useUIStore.setState({ draggableNodeDescendantsIds: descendantsIds });
          useUIStore.setState({ dragNDropPlacement: placement });

          // Trigger rerender only for one node
          useStore.getState().triggerNodeRender(event.over.id as string);
        }
      }}
      onDragOver={(_event) => {
        // console.debug(`onDragOver`, event);
      }}
      onDragEnd={(event) => {
        if (!event.over) return;
        const activeId = String(event.active.id);
        const overId = String(event.over.id);

        // const el = document.getElementById(`${event.active.id}`)!;
        // el.classList.remove("bg-gray-200");

        // console.log("onDragEnd", activeId, overId);

        if (activeId === overId) return;
        const placement = useUIStore.getState().dragNDropPlacement;
        const activeNode = TreeRoAPI.getNode(activeId);
        const overNode = TreeRoAPI.getNode(overId);
        const activeParent = TreeRoAPI.getNodeParent(activeId);
        const overParent = TreeRoAPI.getNodeParent(overId);
        if (!activeParent || !overParent || !activeNode || !overNode) return;

        console.log(`Move %c${activeId}%c over %c${overId}%c`, "color: red;", "", "color: red;", "");
        if (placement === "below") {
          if (overNode.collapsed === false && overNode.children.length !== 0) {
            console.debug("placement below 1");
            TreeRoAPI.moveNode(activeId, overId, 0);
          } else {
            console.debug("placement below 2");
            TreeRoAPI.moveNodeRelativeTo(activeId, overId, 1);
          }
        } else if (placement === "above") {
          console.debug("placement above");
          TreeRoAPI.moveNodeRelativeTo(activeId, overId, -1);
        } else if (placement === "inside") {
          if (overNode.collapsed === false && overNode.children.length !== 0) {
            console.debug("placement inside 1");
            TreeRoAPI.moveNode(activeId, overId, 0);
          } else {
            console.debug("placement inside 2");
            TreeRoAPI.moveNode(activeId, overId, -1);
          }
        }
      }}
    >
      <div className="Document" data-id={currentDocId}>
        <div className="RootNode-outer">
          <div className="RootNode-inner">
            <div className="RootNode-self mb-3">
              <NodeContentComponent nodeId={rootNode.node_id} nodeContent={rootNode.content} />
            </div>
            <div className="RootNodeChildren flex flex-col gap-1">
              {childNodes.map((childNode) => (
                <NodeComponent key={childNode.node_id} nodeId={childNode.node_id} />
              ))}
              {/* Remember that it is located in the document container so it inherits styles and behaviour */}
              <DragOverlay>
                {activeId ? <div className="inline-block border border-black bg-white px-1 cursor-grabbing">Move node</div> : null}
              </DragOverlay>
              <ToastContainer position="top-right" autoClose={3_000} hideProgressBar={true} closeButton={true} style={{ top: 50 }} />
              <div className="Document-bottom-spacer h-100" />
            </div>
          </div>
        </div>
      </div>
    </DndContext>
  );
}

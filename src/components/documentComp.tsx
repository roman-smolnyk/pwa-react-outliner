// import { EllipsisVertical, Minus, PlusCircle } from "lucide-react";
// import { PlusCircle } from "@phosphor-icons/react";
import { DragOverlay } from "@dnd-kit/core";
import { useEffect, useRef, useState } from "react";
import { TreeRoAPI } from "../api";
import { NodeComponent, NodeContentComponent } from "../components/nodeComp";
import { useStore } from "../stateStore";
import { DnDWrapperComponent } from "./dndComp";
import { NodeOptionsComponent } from "./menusComp";

export default function DocumentComponent() {
  const ref = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState("");

  const currentDocumentId = useStore((state) => state.localConfig.currentDocumentId);

  const rootNode = useStore((state) => {
    if (!TreeRoAPI.isIntialized()) return null;
    const rootNodeId = TreeRoAPI.getDocumentRootNodeId(state.localConfig.currentDocumentId);
    // console.debug("rootNodeId", rootNodeId)
    if (!rootNodeId) return null;
    return state.nodes.get(rootNodeId);
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: explanation
  useEffect(() => {
    if (ref.current?.parentElement) {
      ref.current.parentElement.scrollTop = 0;
    }
  }, [currentDocumentId]);

  if (!rootNode) return null;

  return (
    <div className="Document relative min-w-xs h-full w-full z-1" ref={ref} data-id={currentDocumentId}>
      <div className="Document-header-space h-10 md:h-6" />
      <div
        className="Document-scroll h-[calc(100vh-5rem)] md:h-[calc(100vh-3rem)] overflow-y-auto overscroll-y-contain
                  px-5 md:px-16 lg:px-32 xl:px-56 2xl:px-70"
        // style={{
        //   height: `calc(100vh - 2.5rem)`, // example if header/footer 2.5rem each
        // }}
      >
        <div className="Document-top-spacer h-10 md:h-15" />
        <div className="RootNode-outer">
          <div className="RootNode-inner">
            <div className="RootNode-self flex items-start mb-3">
              <NodeContentComponent nodeId={rootNode.node_id} nodeContent={rootNode.content} />
              <NodeOptionsComponent nodeId={rootNode.node_id} />
            </div>
            <div className="RootNodeChildren flex flex-col gap-1">
              <DnDWrapperComponent
                onDragStart={(event) => {
                  // console.debug("onDragStart", event);
                  setActiveId(event.active.id as string);
                }}
                onDragMoveCallback={(event, dndCoordinates) => {
                  if (!event.over) return;
                  const rect = TreeRoAPI.useStore.getState().dndRectEl?.getBoundingClientRect();
                  if (rect) {
                    const rectPageTop = rect.top + dndCoordinates.scrollY;
                    const middleX = 200;
                    const middleY = rectPageTop + rect.height / 2;
                    const offsetFromLeft = dndCoordinates.pointerX - (rect.left + scrollX);
                    const shouldIndent = offsetFromLeft > middleX;
                    const position = dndCoordinates.pointerY > middleY ? "after" : "before";
                    const placement = shouldIndent && position === "after" ? "inside" : position;
                    TreeRoAPI.useStore.setState({ dndPlacement: placement });
                    TreeRoAPI.useStore.getState().triggerDnDRender(event.over.id as string);
                  }
                }}
                onDragEnd={(event) => {
                  // console.debug("onDragEnd", event);
                  if (!event.over) return;
                  const activeId = String(event.active.id);
                  const overId = String(event.over.id);

                  if (activeId === overId) return;
                  const placement = useStore.getState().dndPlacement;
                  if (!placement) return;
                  const activeNode = TreeRoAPI.getNode(activeId);
                  const overNode = TreeRoAPI.getNode(overId);
                  const activeParent = TreeRoAPI.getNodeParent(activeId);
                  const overParent = TreeRoAPI.getNodeParent(overId);
                  if (!activeParent || !overParent || !activeNode || !overNode) return;
                  if (TreeRoAPI.useStore.getState().dndDescendantsIds.includes(activeId)) return;

                  // console.debug(`Move %c${activeId}%c over %c${overId}%c`, "color: red;", "", "color: red;", "");
                  if (placement === "after") {
                    if (overNode.collapsed === false && overNode.children.length !== 0) {
                      // console.debug("placement after moveNode");
                      TreeRoAPI.moveNode(activeId, overId, 0);
                    } else {
                      // console.debug("placement after moveNodeAfter");
                      TreeRoAPI.moveNodeAfter(activeId, overId);
                    }
                  } else if (placement === "before") {
                    // console.debug("placement before moveNodeBefore");
                    TreeRoAPI.moveNodeBefore(activeId, overId);
                  } else if (placement === "inside") {
                    if (overNode.collapsed === false && overNode.children.length !== 0) {
                      // console.debug("placement inside moveNode 0");
                      TreeRoAPI.moveNode(activeId, overId, 0);
                    } else {
                      // console.debug("placement inside moveNode -1");
                      TreeRoAPI.moveNode(activeId, overId, -1);
                    }
                  }
                }}
              >
                {rootNode.children.map((childId) => (
                  <NodeComponent key={childId} nodeId={childId} />
                ))}
                {/* Remember that it is located in the document container so it inherits styles and behaviour */}
                <DragOverlay>
                  {activeId ? <div className="inline-block border border-black bg-white px-1 cursor-grabbing">Move node</div> : null}
                </DragOverlay>
              </DnDWrapperComponent>
            </div>
          </div>
        </div>
        <div className="Document-bottom-spacer h-100" />
      </div>
    </div>
  );
}

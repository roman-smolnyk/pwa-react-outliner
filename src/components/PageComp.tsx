// import { EllipsisVertical, Minus, PlusCircle } from "lucide-react";
// import { PlusCircle } from "@phosphor-icons/react";
import { DragOverlay } from "@dnd-kit/core";
import { memo, useEffect, useRef, useState } from "react";
import { useStore } from "../stateStore";
import { DnDWrapperComponent } from "./DndComp";
import { PlainMarkdownComponent } from "./MarkdownComp";
import { NodeOptionsButtonComponent } from "./MenusComp";
import { BlockComponent, NodeContentComponent } from "./NodeComp";
import { DocumentSearchComponent } from "./SearchDocumentComp";
import { TreeRoAPI } from "../apis/treeroApi";
import { Block, Page, Collection, Workspace, YjsManager } from "esm-treero-api";

export default function PageComponent({ pageId, blockId }: { pageId: string; blockId: string }) {
  console.debug("PageComponent", pageId, blockId);

  const ref = useRef<HTMLDivElement>(null);
  const currentPageId = useStore((state) => state.localConfig.currentPageId);
  const documentSearchIsOpened = useStore((state) => state.documentSearchIsOpened);

  // console.debug(`DocumentComponent:node_id`, node_id);
  console.debug(`DocumentComponent:currentPageId`, currentPageId);

  useEffect(() => {
    // console.debug(`useEffect`, document_id ? TreeRoAPI.getDocument(document_id) : null);
    // if (document_id && TreeRoAPI.getDocument(document_id)) {
    //   TreeRoAPI.uiOpenNode(TreeRoAPI.getDocumentRootNodeId(document_id)!, document_id);
    // }
    // console.debug(`useEffect`, node_id ? TreeRoAPI.getNode(node_id) : null);
    if (block_id) {
      TreeRoAPI.openBlock(block_id);
    }
  }, [block_id]);

  // Scroll to top
  useEffect(() => {
    const container = ref.current?.firstElementChild;

    if (container instanceof HTMLElement) {
      container.scrollTop = 0;
    }
  }, [currentPageId]);

  if (!TreeRoAPI.useStore.getState().stateIsInitialized) return;

  return (
    <div className="Document relative z-1 flex min-w-xs min-h-0 flex-col" ref={ref} data-id={currentPageId}>
      {documentSearchIsOpened ? <DocumentSearchComponent /> : <div className="Document-placeholder-top mt-12 sm:mt-8" />}
      <div
        className="Document-scroll flex-1 overflow-y-auto overscroll-y-contain
                  px-5 sm:px-16 lg:px-32 xl:px-56 2xl:px-70
                  pt-12 pb-100
                  "
        // style={{
        //   height: `calc(100dvh - 2.5rem)`, // example if header/footer 2.5rem each
        // }}
      >
        <RootBlockComponent />
      </div>
      <div className="Document-placeholder-bottom mb-12 sm:mb-8" />
    </div>
  );
}

function NodePathPartComponent({ nodeId, part }: { nodeId: string; part: string }) {
  return (
    <span className="text-sm text-gray-500 inline-flex items-center">
      <span
        className="hover:underline cursor-pointer max-w-30 truncate"
        onClick={() => {
          TreeRoAPI.openBlock(nodeId);
        }}
      >
        <PlainMarkdownComponent>{part}</PlainMarkdownComponent>
      </span>
      <span className="mx-1">/</span>
    </span>
  );
}

function NodePathComponent({ nodeId }: { nodeId: string }) {
  const block = Block.get(nodeId);
  if (!block) return;
  const pathMap = block.traversePath().map((a) => a.content);

  // const pathValues = Array.from(pathMap.values());

  return (
    <div className="mb-5">
      {[...pathMap].map(([k, v], idx) => {
        // biome-ignore lint/suspicious/noArrayIndexKey: explanation
        return <NodePathPartComponent key={idx} nodeId={k} part={v} />;
      })}
    </div>
  );
}

const RootBlockComponent = memo(() => {
  const [activeId, setActiveId] = useState(""); // DnD

  const rootBlock = useStore((state) => {
    return state.blocks.get(state.localConfig.currentBlockId);
  });

  if (!rootBlock) return null;

  return (
    <>
      {rootBlock.parent_id && <NodePathComponent nodeId={rootBlock.block_id} />}
      <div className="RootNode-outer">
        <div className="RootNode-inner">
          <div className="RootNode-self flex items-start mb-3">
            <NodeContentComponent nodeId={rootBlock.block_id} nodeContent={rootBlock.content} />
            <NodeOptionsButtonComponent nodeId={rootBlock.block_id} isRootNode={true} />
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
                const activeBlock = Block.get(activeId);
                const overBlock = Block.get(overId);
                const activeParent = activeBlock?.parent();
                const overParent = overBlock?.parent();
                if (!activeParent || !overParent || !activeBlock || !overBlock) return;
                if (TreeRoAPI.useStore.getState().dndDescendantsIds.includes(activeId)) return;

                // console.debug(`Move %c${activeId}%c over %c${overId}%c`, "color: red;", "", "color: red;", "");
                if (placement === "after") {
                  if (overBlock.collapsed === false && overBlock.children.length !== 0) {
                    // console.debug("placement after moveNode");
                    // TreeRoAPI.moveNode(activeId, overId, 0);
                    activeBlock.move(overId, 0);
                  } else {
                    // console.debug("placement after moveNodeAfter");
                    // TreeRoAPI.moveNodeAfter(activeId, overId);
                    activeBlock.moveAfter(overId);
                  }
                } else if (placement === "before") {
                  // console.debug("placement before moveNodeBefore");
                  activeBlock.moveBefore(overId);
                  // TreeRoAPI.moveNodeBefore(activeId, overId);
                } else if (placement === "inside") {
                  if (overBlock.collapsed === false && overBlock.children.length !== 0) {
                    // console.debug("placement inside moveNode 0");
                    // TreeRoAPI.moveNode(activeId, overId, 0);
                    activeBlock.move(overId, 0);
                  } else {
                    // console.debug("placement inside moveNode -1");
                    activeBlock.move(overId, -1);
                    // TreeRoAPI.moveNode(activeId, overId, -1);
                  }
                }
              }}
            >
              {rootBlock.children.map((childId) => (
                <BlockComponent key={childId} blockId={childId} parentChecked={false} parentCollapsed={rootBlock.collapsed} />
              ))}
              {/* Remember that it is located in the document container so it inherits styles and behaviour */}
              <DragOverlay>
                {activeId ? <div className="inline-block border border-black bg-white px-1 cursor-grabbing">Move node</div> : null}
              </DragOverlay>
            </DnDWrapperComponent>
          </div>
        </div>
      </div>
    </>
  );
});
RootBlockComponent.displayName = "RootNodeComponent";

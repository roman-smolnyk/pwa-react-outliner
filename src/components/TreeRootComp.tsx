// import { EllipsisVertical, Minus, PlusCircle } from "lucide-react";
// import { PlusCircle } from "@phosphor-icons/react";
import { DragOverlay } from "@dnd-kit/core";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import Mark from "mark.js";
import { memo, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { TreeRoAPI } from "../api";
import { scrollIntoView2, useDebouncedCallback } from "../etc/utilities";
import { useStore } from "../stateStore";
import { DnDWrapperComponent } from "./DndComp";
import { PlainMarkdownComponent } from "./MarkdownComp";
import { NodeOptionsButtonComponent } from "./MenusComp";
import { NodeComponent, NodeContentComponent } from "./NodeComp";

function ButtonComponent({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button type="button" className={`cursor-pointer active:scale-90 transition text-gray-600 ${className ?? ""}`} {...props}>
      {children}
    </button>
  );
}

export default function TreeRootComponent() {
  const { node_id } = useParams();

  const ref = useRef<HTMLDivElement>(null);
  const currentDocumentId = useStore((state) => state.localConfig.currentDocumentId);
  const documentSearchIsOpened = useStore((state) => state.documentSearchIsOpened);

  // console.debug(`DocumentComponent:node_id`, node_id);
  console.debug(`DocumentComponent:currentDocumentId`, currentDocumentId);

  useEffect(() => {
    // console.debug(`useEffect`, document_id ? TreeRoAPI.getDocument(document_id) : null);
    // if (document_id && TreeRoAPI.getDocument(document_id)) {
    //   TreeRoAPI.uiOpenNode(TreeRoAPI.getDocumentRootNodeId(document_id)!, document_id);
    // }
    console.debug(`useEffect`, node_id ? TreeRoAPI.getNode(node_id) : null);
    if (node_id && TreeRoAPI.getNode(node_id)) {
      TreeRoAPI.uiOpenNode(node_id);
    }
  }, [node_id]);

  // Scroll to top
  useEffect(() => {
    const container = ref.current?.firstElementChild;

    if (container instanceof HTMLElement) {
      container.scrollTop = 0;
    }
  }, [currentDocumentId]);

  if (!TreeRoAPI.useStore.getState().stateIsInitialized) return;

  return (
    <div className="Document relative z-1 flex min-w-xs min-h-0 flex-col" ref={ref} data-id={currentDocumentId}>
      {documentSearchIsOpened ? <DocumentSearchComponent /> : <div className="Document-top-placeholder mt-12 sm:mt-8"></div>}
      <div
        className="Document-scroll flex-1 overflow-y-auto overscroll-y-contain
                  px-5 sm:px-16 lg:px-32 xl:px-56 2xl:px-70
                  pt-12 pb-100
                  "
        // style={{
        //   height: `calc(100dvh - 2.5rem)`, // example if header/footer 2.5rem each
        // }}
      >
        <RootNodeComponent />
      </div>
    </div>
  );
}

function DocumentSearchComponent() {
  const refInput = useRef<HTMLInputElement | null>(null);
  const instancerRef = useRef<Mark | null>(null);

  const [index, setIndex] = useState(0);
  const [query, setQuery] = useState("");
  const [markElements, setMarkElements] = useState<NodeListOf<Element> | Array<Element>>([]);

  // const currentDocumentId = useStore((state) => state.localConfig.currentDocumentId);

  const callback = useDebouncedCallback((query: string) => {
    const container = document.querySelector(".Document-scroll");
    if (container) {
      const instance = new Mark(container as HTMLElement);

      instance.unmark({
        done: () => {
          instance.mark(query, {
            done: () => {
              setMarkElements(document.querySelectorAll("mark[data-markjs='true']"));
            },
            exclude: ["[data-no-mark]"],
          });
        },
      });
    }
  }, 200);

  useEffect(() => {
    callback(query);

    // Does not work for some reason
    return () => {
      if (instancerRef.current) {
        instancerRef.current.unmark();
      }
    };
  }, [query]);

  useEffect(() => {}, [query]);

  // const filteredNodes = useMemo(() => {
  //   if (!debouncedQuery.trim()) return [];

  //   const lowerQuery = debouncedQuery.toLowerCase();
  //   const nodeList = Array.from(TreeRoAPI.getNodes(currentDocumentId));

  //   return nodeList.filter((node) => node.content.toString().toLowerCase().includes(lowerQuery));
  // }, [debouncedQuery]);

  useEffect(() => {
    refInput.current?.focus();
  }, []);

  return (
    <div
      className="DocumentSearch min-w-xs
                mt-14 sm:mt-10
                px-5 sm:px-16 lg:px-32 xl:px-56 2xl:px-70
                "
    >
      <div className="flex items-center gap-2 text-base px-1">
        <input
          ref={refInput}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search..."
          className="flex-1 rounded px-2 py-1 min-w-0
                    border border-gray-300 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
        />
        <div className="text-gray-500">{`${index}/${markElements?.length || 0}`}</div>
        <ButtonComponent
          onPointerDown={(e) => {
            e.preventDefault();
            if (index > 1) {
              const newIndex = index - 1;
              const element = markElements[newIndex - 1];
              const container = document.querySelector(".Document-scroll");
              if (element && container) {
                scrollIntoView2(element as HTMLElement, container as HTMLElement);
              }
              setIndex(newIndex);
            } else {
              const newIndex = markElements?.length || 0;
              const element = markElements[newIndex - 1];
              const container = document.querySelector(".Document-scroll");
              if (element && container) {
                scrollIntoView2(element as HTMLElement, container as HTMLElement);
              }
              setIndex(newIndex);
            }
          }}
        >
          <ArrowUpIcon />
        </ButtonComponent>
        <ButtonComponent
          onPointerDown={(e) => {
            e.preventDefault();

            if (index < markElements?.length || 0) {
              const newIndex = index + 1;
              const element = markElements[newIndex - 1];
              const container = document.querySelector(".Document-scroll");
              if (element && container) {
                console.log("ArrowDownIcon", index);
                scrollIntoView2(element as HTMLElement, container as HTMLElement);
              }
              setIndex(newIndex);
            } else {
              const newIndex = 1;
              const element = markElements[newIndex - 1];
              const container = document.querySelector(".Document-scroll");
              if (element && container) {
                console.log("ArrowDownIcon", index);
                scrollIntoView2(element as HTMLElement, container as HTMLElement);
              }
              setIndex(newIndex);
            }
          }}
        >
          <ArrowDownIcon />
        </ButtonComponent>
      </div>
    </div>
  );
}

function NodePathPartComponent({ nodeId, part }: { nodeId: string; part: string }) {
  return (
    <span className="text-sm text-gray-500 inline-flex items-center">
      <span
        className="hover:underline cursor-pointer max-w-30 truncate"
        onClick={() => {
          TreeRoAPI.uiOpenNode(nodeId);
        }}
      >
        <PlainMarkdownComponent>{part}</PlainMarkdownComponent>
      </span>
      <span className="mx-1">/</span>
    </span>
  );
}

function NodePathComponent({ nodeId }: { nodeId: string }) {
  const pathMap = TreeRoAPI.traverseNodePath(nodeId);

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

const RootNodeComponent = memo(() => {
  const [activeId, setActiveId] = useState(""); // DnD

  const rootNode = useStore((state) => {
    return state.nodes.get(state.localConfig.currentNodeId);
  });

  if (!rootNode) return null;

  return (
    <>
      {rootNode.parent_id && <NodePathComponent nodeId={rootNode.node_id} />}
      <div className="RootNode-outer">
        <div className="RootNode-inner">
          <div className="RootNode-self flex items-start mb-3">
            <NodeContentComponent nodeId={rootNode.node_id} nodeContent={rootNode.content} />
            <NodeOptionsButtonComponent nodeId={rootNode.node_id} isRootNode={true} />
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
                <NodeComponent key={childId} nodeId={childId} parentChecked={false} parentCollapsed={rootNode.collapsed} />
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
RootNodeComponent.displayName = "RootNodeComponent";

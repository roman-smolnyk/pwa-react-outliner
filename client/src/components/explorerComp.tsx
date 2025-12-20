import { DragOverlay } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { FilePlusIcon, FolderPlusIcon, PanelLeftCloseIcon, SearchIcon } from "lucide-react";
import { useState, memo, useRef, useLayoutEffect } from "react";
import { TreeRoAPI } from "../api";
import { useStore } from "../stateStore";
import { DnDWrapperComponent } from "./dndComp";

import { PlainMarkdownComponent } from "./markdownComp";

import { FolderInputIcon, FolderDownIcon, FolderIcon, FileTextIcon } from "lucide-react";

function ButtonComponent({ children, onClick }: { children: React.ReactNode; onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void }) {
  return (
    <button className="cursor-pointer active:scale-90 transition" type="button" onClick={onClick}>
      {children}
    </button>
  );
}

function DropIndicatorComponent({ shrink = false }) {
  // console.debug(placement);
  return (
    <div className="flex items-start justify-end">
      <div className={`h-1 rounded bg-blue-500 ${shrink ? "w-3/4" : "w-full"}`} />
    </div>
  );
}

const GroupItemComponent = memo(({ groupId }: { groupId: string }) => {
  const refX = useRef<HTMLDivElement>(null);

  const ref = useRef<HTMLDivElement>(null);
  const refNodeSelf = useRef<HTMLDivElement>(null);
  const [isEditing] = useState(false);

  useStore((state) => {
    return state.dndToRerender[groupId];
  });

  // zustand subscribe
  const group = useStore((state) => {
    return state.groups.get(groupId);
  });

  const { setNodeRef, attributes, listeners, active, over, isDragging, isOver } = useSortable({
    id: groupId,
  });

  const combinedRef = (element: HTMLDivElement | null) => {
    setNodeRef(element); // dnd-kit needs this
    ref.current = element; // your own ref
  };

  useLayoutEffect(() => {
    if (!refX.current) return;

    refX.current.innerText = refX.current.textContent?.replace("\n", " ") || "";
  }, []);

  if (!group) return;

  if (isDragging) {
    // console.debug("isDragging", attributes, listeners);
    const descendantsIds = TreeRoAPI.getGroupDescendantsIds(groupId);
    useStore.setState({ dndDescendantsIds: descendantsIds });
  }

  let placement = null;
  if (isOver) {
    // console.debug("isOver", attributes, listeners);
    TreeRoAPI.useStore.setState({ dndRectEl: refNodeSelf.current });
    if (active?.id && over?.id && active.id !== over.id) {
      if (!useStore.getState().dndDescendantsIds.includes(groupId)) {
        placement = TreeRoAPI.useStore.getState().dndPlacement;
      }
    }
  }

  return (
    // data-id={node.node_id}
    <div id={groupId} className={`GroupItem-outer ${isDragging ? "bg-gray-200" : ""}`} ref={combinedRef}>
      <div className="GroupItem-inner">
        {over?.id === groupId && placement === "before" && <DropIndicatorComponent />}
        <div
          className="GroupItem-self py-1 md:py-0
        hover:bg-gray-200
        flex items-start gap-1"
          ref={refNodeSelf}
          data-id={groupId}
        >
          <button
            className="GroupItem-bullet flex-none size-6 md:size-5
            cursor-pointer
            flex items-center justify-center"
            type="button"
            {...listeners}
            {...attributes}
            // data-node-id={node.id}
            onPointerUpCapture={() => {
              console.debug("onPointerUpCapture");
              TreeRoAPI.toggleGroupCollapse(groupId);
            }}
          >
            {group.children.length > 0 ? (
              group.collapsed ? (
                <FolderInputIcon className="w-full h-full text-gray-600" />
              ) : (
                <FolderDownIcon className="w-full h-full text-gray-600" />
              )
            ) : (
              <FolderIcon className="w-full h-full text-gray-600" />
            )}
          </button>

          <div
            className="GroupItem-btn flex-1 min-w-0 cursor-pointer
            flex items-start"
            onPointerUpCapture={() => {
              console.debug("onPointerUpCapture");
              TreeRoAPI.toggleGroupCollapse(groupId);
            }}
          >
            {!isEditing ? (
              <div ref={refX} className="flex-1 truncate">
                {group.name}
              </div>
            ) : (
              <div>{group.name}</div>
            )}
          </div>
          <button className="GroupItem-options flex flex-none items-center justify-center cursor-pointer min-h-5 min-w-5" type="button">
            {/* <span>⋮</span> */}
            <i className="ph-bold ph-dots-three-vertical text-[1.2rem]"></i>
            {/* <EllipsisVertical className="size-4" /> */}
          </button>

          {/* // ! ID */}
          {/* <div className="DocumentDebugId text-xs">{document.document_id.split("-").pop()}</div> */}
        </div>
        {over?.id === groupId && placement === "after" && <DropIndicatorComponent />}
        {over?.id === groupId && placement === "inside" && <DropIndicatorComponent shrink={true} />}
        <div
          className={`GroupItemChildren flex-col ml-2 pl-4
          border-l border-gray-200 
          flex gap-1 ${group.collapsed ? "hidden!" : ""}`}
        >
          {group.children.map((childId) => (
            <ExplorerItemComponent key={childId} itemId={childId} />
          ))}
        </div>
      </div>
    </div>
  );
});

function DocumentItemTitleComponent({ rootNodeId, nodeContent }: { rootNodeId: string; nodeContent: string }) {
  const [name, setName] = useState(nodeContent);

  return (
    <input
      type="text"
      value={name}
      onChange={(e) => setName(e.target.value)}
      onBlur={(e) => {
        const value = e.target.value;
        if (value !== nodeContent) {
          TreeRoAPI.updateNode(rootNodeId, { content: value });
        }
      }}
      onKeyDown={(e) => e.key === "Enter" && e.currentTarget?.blur()}
    />
  );
}

const DocumentItemComponent = memo(({ documentId }: { documentId: string }) => {
  const refX = useRef<HTMLDivElement>(null);

  const ref = useRef<HTMLDivElement>(null);
  const refNodeSelf = useRef<HTMLDivElement>(null);
  const [isEditing] = useState(false);

  useStore((state) => {
    return state.dndToRerender[documentId];
  });

  // zustand subscribe
  const document_ = useStore((state) => {
    return state.documents.get(documentId);
  });

  const rootNode = useStore((state) => {
    if (!document_) return;
    return state.nodes.get(document_.root_node_id);
  });

  const currentDocumentId = useStore((state) => {
    return state.localConfig.currentDocumentId;
  });

  const { setNodeRef, attributes, listeners, active, over, isDragging, isOver } = useSortable({
    id: documentId,
  });

  const combinedRef = (element: HTMLDivElement | null) => {
    setNodeRef(element); // dnd-kit needs this
    ref.current = element; // your own ref
  };

  useLayoutEffect(() => {
    if (!refX.current) return;

    refX.current.innerText = refX.current.textContent?.replace("\n", " ") || "";
  }, []);

  if (!document_ || !rootNode) return;

  if (isDragging) {
    // console.debug("isDragging", attributes, listeners);
    useStore.setState({ dndDescendantsIds: [] });
  }

  let placement = null;
  if (isOver) {
    // console.debug("isOver", attributes, listeners);
    TreeRoAPI.useStore.setState({ dndRectEl: refNodeSelf.current });
    if (active?.id && over?.id && active.id !== over.id) {
      if (!useStore.getState().dndDescendantsIds.includes(documentId)) {
        console.debug(documentId, useStore.getState().dndDescendantsIds);
        placement = TreeRoAPI.useStore.getState().dndPlacement;
      }
    }
  }

  return (
    <div
      id={documentId}
      className={`DocumentItem-outer ${isDragging ? "bg-gray-200" : ""} ${currentDocumentId === documentId ? "bg-gray-200" : ""}`}
      ref={combinedRef}
    >
      <div className="DocumentItem-inner">
        {over?.id === documentId && placement === "before" && <DropIndicatorComponent />}
        <div
          className="DocumentItem-self py-1 md:py-0
        hover:bg-gray-100
        flex items-start gap-1 "
          ref={refNodeSelf}
          data-id={documentId}
        >
          <button
            className="GroupItem-bullet flex-none size-6 md:size-5
            cursor-pointer
            flex items-center justify-center"
            type="button"
            {...listeners}
            {...attributes}
          >
            <FileTextIcon className="w-full h-full text-gray-600 " />
          </button>

          <div
            className="DocumentItem-title flex-1 min-w-0 cursor-pointer flex items-start"
            onPointerUpCapture={() => {
              TreeRoAPI.setCurrentDocumentId(documentId);
              console.log("onPointerUpCapture");
            }}
          >
            {!isEditing ? (
              <div ref={refX} className="flex-1 truncate">
                <PlainMarkdownComponent>{rootNode.content}</PlainMarkdownComponent>
              </div>
            ) : (
              <DocumentItemTitleComponent rootNodeId={rootNode.node_id} nodeContent={rootNode.content} />
            )}
          </div>
          <button className="DocumentItem-options flex flex-none items-center justify-center cursor-pointer min-h-5 min-w-5" type="button">
            {/* <span>⋮</span> */}
            <i className="ph-bold ph-dots-three-vertical text-[1.2rem]"></i>
            {/* <EllipsisVertical className="size-4" /> */}
          </button>

          {/* // ! ID */}
          {/* <div className="DocumentDebugId text-xs">{document.document_id.split("-").pop()}</div> */}
        </div>
        {over?.id === documentId && (placement === "after" || placement === "inside") && <DropIndicatorComponent />}
      </div>
    </div>
  );
});

export function ExplorerItemComponent({ itemId }: { itemId: string }) {
  const state = TreeRoAPI.useStore.getState();
  const documentItem = state.documents.get(itemId);
  const groupItem = state.groups.get(itemId);
  if (documentItem) {
    return <DocumentItemComponent documentId={itemId} />;
  } else if (groupItem) {
    GroupItemComponent;
    return <GroupItemComponent groupId={itemId} />;
  } else {
    return <div>{"ERRORRRR"}</div>;
  }
}

function NavBarComponent() {
  const explorerIsOpened = useStore((state) => state.explorerIsOpened);

  return (
    <div
      className="ExplorerHeader fixed top-0 min-h-8 
      bg-white shadow-[0_1px_5px_rgba(0,0,0,0.15)]"
      style={{ width: `${explorerIsOpened ? "var(--sidebar-width)" : "0px"}` }}
    >
      <div className="px-2 py-3 md:py-1 flex items-center">
        {/* Left icons */}
        <div className="flex items-center gap-2">
          <ButtonComponent
            onClick={(_) => {
              TreeRoAPI.useStore.setState({ explorerIsOpened: false });
            }}
          >
            <PanelLeftCloseIcon className="text-gray-600" />
          </ButtonComponent>
        </div>

        {/* Right icons */}
        <div className="flex ml-auto items-center gap-2">
          <ButtonComponent onClick={(_) => {}}>
            <FilePlusIcon className="text-gray-600" />
          </ButtonComponent>
          <ButtonComponent onClick={(_) => {}}>
            <FolderPlusIcon className="text-gray-600" />
          </ButtonComponent>
          <ButtonComponent onClick={(_) => {}}>
            <SearchIcon className="text-gray-600" />
          </ButtonComponent>
          <div></div>
        </div>
      </div>
    </div>
  );
}

export default function ExplorerComponent() {
  const [activeId, setActiveId] = useState("");

  // const onResize = (w: number) => {
  //   document.documentElement.style.setProperty("--sidebar-width", `${w}px`);
  // };

  const explorerIsOpened = useStore((state) => state.explorerIsOpened);

  const rootGroup = useStore((state) => {
    if (!TreeRoAPI.isIntialized()) return null;
    const rootGroupId = TreeRoAPI.getRootGroupId();
    // console.debug("rootGroupId", rootGroupId)
    if (!rootGroupId) return null;
    return state.groups.get(rootGroupId);
  });

  if (!rootGroup) return null;

  console.debug("rootGroup", rootGroup);

  return (
    <aside
      className={`Explorer relative h-screen bg-white shadow-[1px_0px_5px_rgba(0,0,0,0.15)] z-75 ${explorerIsOpened ? "" : "hidden"}`}
      style={{ width: "var(--sidebar-width)" }}
    >
      <NavBarComponent />
      <div className="Explorer-top-spacer h-12 md:h-8" />
      <div>
        <DnDWrapperComponent
          onDragStart={(event) => {
            console.log("onDragStart", event);
            setActiveId(event.active.id as string);
          }}
          onDragMoveCallback={(event, dndCoordinates) => {
            if (!event.over) return;
            const rect = TreeRoAPI.useStore.getState().dndRectEl?.getBoundingClientRect();
            if (rect) {
              const rectPageTop = rect.top + dndCoordinates.scrollY;
              const middleX = 80;
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
            console.log("onDragEnd", event);
            if (!event.over) return;
            const activeId = String(event.active.id);
            const overId = String(event.over.id);

            if (activeId === overId) return;
            const placement = useStore.getState().dndPlacement;
            if (!placement) return;
            const activeDocument = TreeRoAPI.getDocument(activeId);
            const activeGroup = TreeRoAPI.getGroup(activeId);
            const overDocument = TreeRoAPI.getDocument(overId);
            const overGroup = TreeRoAPI.getGroup(overId);
            const activeParent = TreeRoAPI.getParentGroup(activeId);
            const overParent = TreeRoAPI.getParentGroup(overId);
            if (!activeParent || !overParent) return;

            console.log(`Move %c${activeId}%c over %c${overId}%c`, "color: red;", "", "color: red;", "");
            if (activeDocument && overDocument) {
              if (placement === "after") {
                console.debug("moveDocumentAfter", placement);
                TreeRoAPI.moveDocumentAfter(activeId, overId);
              } else if (placement === "before") {
                console.debug("moveDocumentBefore", placement);
                TreeRoAPI.moveDocumentBefore(activeId, overId);
              } else if (placement === "inside") {
                console.debug("moveDocumentAfter", placement);
                TreeRoAPI.moveDocumentAfter(activeId, overId);
              }
            } else if (activeDocument && overGroup) {
              if (placement === "after") {
                console.debug("moveDocumentAfter", placement);
                TreeRoAPI.moveDocumentAfter(activeId, overId);
              } else if (placement === "before") {
                console.debug("moveDocumentBefore", placement);
                TreeRoAPI.moveDocumentBefore(activeId, overId);
              } else if (placement === "inside") {
                if (overGroup.collapsed === false && overGroup.children.length !== 0) {
                  console.debug("moveDocument", placement, 0);
                  TreeRoAPI.moveDocument(activeId, overId, 0);
                } else {
                  console.debug("moveDocument", placement, -1);
                  TreeRoAPI.moveDocument(activeId, overId, -1);
                }
              }
            } else if (activeGroup && overDocument) {
              if (placement === "after") {
                console.debug("moveGroupAfter", placement);
                TreeRoAPI.moveGroupAfter(activeId, overId);
              } else if (placement === "before") {
                console.debug("moveGroupBefore", placement);
                TreeRoAPI.moveGroupBefore(activeId, overId);
              } else if (placement === "inside") {
                console.debug("moveGroupAfter", placement);
                TreeRoAPI.moveGroupAfter(activeId, overId);
              }
            } else if (activeGroup && overGroup) {
              if (placement === "after") {
                console.debug("moveGroupAfter", placement);
                TreeRoAPI.moveGroupAfter(activeId, overId);
              } else if (placement === "before") {
                console.debug("moveGroupBefore", placement);
                TreeRoAPI.moveGroupBefore(activeId, overId);
              } else if (placement === "inside") {
                if (overGroup.collapsed === false && overGroup.children.length !== 0) {
                  console.debug("moveGroup", placement, 0);
                  TreeRoAPI.moveGroup(activeId, overId, 0);
                } else {
                  console.debug("moveGroup", placement, -1);
                  TreeRoAPI.moveGroup(activeId, overId, -1);
                }
              }
            }

            // if (TreeRoAPI.useStore.getState().dndDescendantsIds.includes(activeId)) return;
          }}
        >
          {/* <div className="Explorer-top-spacer h-5" /> */}
          <div className="RootGroup-outer">
            <div className="RootGroup-inner">
              <div className="RootGroupChildren flex flex-col gap-1 py-4 pl-5 md:pl-2 pr-3 md:pr-2">
                {rootGroup.children.map((childId) => (
                  <ExplorerItemComponent key={childId} itemId={childId} />
                  // <NodeComponent key={childId} nodeId={childId} />
                ))}
                {/* Remember that it is located in the document container so it inherits styles and behaviour */}
                <DragOverlay>
                  {activeId ? <div className="inline-block border border-black bg-white px-1 cursor-grabbing">Move</div> : null}
                </DragOverlay>
                <div className="Explorer-bottom-spacer h-5" />
              </div>
            </div>
          </div>
        </DnDWrapperComponent>
      </div>
    </aside>
  );
}

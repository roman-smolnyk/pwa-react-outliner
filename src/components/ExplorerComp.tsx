import { DragOverlay } from "@dnd-kit/core";
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
import { TreeRoAPI } from "../api";
import { useStore } from "../stateStore";
import { DnDWrapperComponent } from "./DndComp";
import { PlainMarkdownComponent } from "./MarkdownComp";
import { DocumentOptionsComponent, GroupOptionsComponent } from "./MenusComp";
import { GlobalSearchPortalComponent } from "./SearchGlobalComp";
// import { useNavigate } from "react-router-dom";

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

function DropIndicatorComponent({ shrink = false }) {
  if (shrink) {
    return (
      <div className="relative before:absolute before:content-[''] before:top-0 before:end-0 before:h-1 before:w-3/4 before:bg-blue-400 before:-translate-y-1/2" />
    );
  } else {
    return (
      <div className="relative before:absolute before:content-[''] before:top-0 before:start-0 before:end-0 before:h-1 before:bg-blue-400 before:-translate-y-1/2" />
    );
  }
}

function GroupItemTitleComponent({ groupId, name, setRenaming }: { groupId: string; name: string; setRenaming: (v: boolean) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(name);

  useEffect(() => {
    const input = ref.current;
    if (!input) return;
    input.focus();
    // place cursor at the beginning
    input.setSelectionRange(0, 0);
  }, []);

  return (
    <input
      className="w-full min-w-0 max-w-full rounded border-none outline-none focus:ring-2 focus:ring-gray-400"
      ref={ref}
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={(e) => {
        const value = e.target.value;
        if (value !== name) {
          TreeRoAPI.updateGroup(groupId, { name: value });
        }
        setRenaming(false);
      }}
      onKeyDown={(e) => e.key === "Enter" && e.currentTarget?.blur()}
    />
  );
}

const GroupItemComponent = memo(({ groupId }: { groupId: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const refNodeSelf = useRef<HTMLDivElement>(null);
  const refDiv = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);

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
    if (!refDiv.current) return;

    refDiv.current.innerText = refDiv.current.textContent?.replace("\n", " ") || "";
  }, []);

  if (!group) return;

  if (isDragging) {
    // console.debug("isDragging", attributes, listeners);
    const descendantsIds = TreeRoAPI.getGroupDescendantsGroupsIds(groupId);
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
          className="GroupItem-self py-1 sm:py-0
                   hover:bg-gray-100
                     flex items-center justify-center gap-1"
          ref={refNodeSelf}
          data-id={groupId}
        >
          <button
            className="GroupItem-bullet flex-none size-6 sm:size-5
            cursor-pointer
            flex items-center justify-center"
            type="button"
            {...listeners}
            {...attributes}
            // data-node-id={node.id}
            onPointerUpCapture={() => {
              // console.debug("onPointerUpCapture");
              TreeRoAPI.uiToggleGroupCollapse(groupId);
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
            className="GroupItem-title flex-1 min-w-0 cursor-pointer select-none
                       flex items-start"
            onPointerUpCapture={() => {
              // console.debug("onPointerUpCapture");
              if (isEditing) return;
              TreeRoAPI.uiToggleGroupCollapse(groupId);
            }}
          >
            {!isEditing ? (
              <div ref={refDiv} className="flex-1 truncate min-h-5">
                {group.name}
              </div>
            ) : (
              <GroupItemTitleComponent groupId={groupId} name={group.name} setRenaming={setIsEditing} />
            )}
          </div>
          <GroupOptionsComponent groupId={groupId} setRenaming={setIsEditing} />
          {/* <button className="GroupItem-options flex flex-none items-center justify-center cursor-pointer min-h-5 min-w-5" type="button">
            <i className="ph-bold ph-dots-three-vertical text-[1.2rem]"></i>
          </button> */}

          {/* // ! ID */}
          {/* <div className="DocumentDebugId text-xs min-w-10">{groupId.slice(30)}</div> */}
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
GroupItemComponent.displayName = "GroupItemComponent";

function DocumentItemTitleComponent({
  rootNodeId,
  nodeContent,
  setRenaming,
}: {
  rootNodeId: string;
  nodeContent: string;
  setRenaming: (v: boolean) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(nodeContent);

  useEffect(() => {
    const input = ref.current;
    if (!input) return;
    input.focus();
    // place cursor at the beginning
    input.setSelectionRange(0, 0);
  }, []);

  return (
    <input
      className="w-full min-w-0 max-w-full border-none outline-none
                 rounded focus:ring-2 focus:ring-gray-400"
      ref={ref}
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={(e) => {
        const value = e.target.value;
        if (value !== nodeContent) {
          TreeRoAPI.updateNode(rootNodeId, { content: value });
        }
        setRenaming(false);
      }}
      onKeyDown={(e) => e.key === "Enter" && e.currentTarget?.blur()}
    />
  );
}

const DocumentItemComponent = memo(({ documentId }: { documentId: string }) => {
  // const navigate = useNavigate();

  const ref = useRef<HTMLDivElement>(null);
  const refNodeSelf = useRef<HTMLDivElement>(null);
  const refDiv = useRef<HTMLDivElement>(null);

  const [isEditing, setIsEditing] = useState(false);

  const setRenaming = useCallback((v: boolean) => {
    setIsEditing(v);
  }, []);

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
        // console.debug(documentId, useStore.getState().dndDescendantsIds);
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
          className={`DocumentItem-self py-1 sm:py-0
                     ${currentDocumentId === documentId ? "hover:bg-gray-200" : "hover:bg-gray-100"}
                     flex items-center justify-center gap-1`}
          ref={refNodeSelf}
          data-id={documentId}
        >
          <button
            className="GroupItem-bullet flex-none size-6 sm:size-5 cursor-pointer
                       flex items-center justify-center"
            type="button"
            {...listeners}
            {...attributes}
          >
            <FileTextIcon className="w-full h-full text-gray-600 " />
          </button>

          <div
            className="DocumentItem-title flex-1 min-w-0 cursor-pointer select-none
                       flex items-start"
            onPointerUpCapture={() => {
              // console.debug("onPointerUpCapture");
              if (isEditing) return;
              // navigate(`/${TreeRoAPI.getDocumentRootNodeId(documentId)}`);
              TreeRoAPI.uiOpenNode(rootNode.node_id);
            }}
          >
            {!isEditing ? (
              <div ref={refDiv} className="flex-1 truncate min-h-5">
                <PlainMarkdownComponent>{rootNode.content}</PlainMarkdownComponent>
              </div>
            ) : (
              <DocumentItemTitleComponent rootNodeId={rootNode.node_id} nodeContent={rootNode.content} setRenaming={setIsEditing} />
            )}
          </div>
          <DocumentOptionsComponent documentId={documentId} setRenaming={setRenaming} />
          {/* <button className="DocumentItem-options flex flex-none items-center justify-center cursor-pointer min-h-5 min-w-5" type="button">
            <i className="ph-bold ph-dots-three-vertical text-[1.2rem]"></i>
          </button> */}

          {/* // ! ID */}
          {/* <div className="DocumentDebugId text-xs min-w-10">{documentId.slice(30)}</div> */}
        </div>
        {over?.id === documentId && (placement === "after" || placement === "inside") && <DropIndicatorComponent />}
      </div>
    </div>
  );
});
DocumentItemComponent.displayName = "DocumentItemComponent";

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
  const globalSearchIsOpened = useStore((state) => state.globalSearchIsOpened);

  const rootGroupId = useStore((state) => state.meta.root_group_id);

  return (
    <div
      className="ExplorerHeader fixed top-0 left-0 min-h-8 
               bg-white shadow-[0_1px_5px_rgba(0,0,0,0.15)]"
      style={{ width: `${explorerIsOpened ? "var(--sidebar-width)" : "0px"}` }}
    >
      {globalSearchIsOpened && <GlobalSearchPortalComponent />}

      <div className="px-2 py-3 sm:py-1 flex items-center">
        {/* Left icons */}
        <div className="flex items-center gap-3 sm:gap-2">
          <ButtonComponent onClick={() => TreeRoAPI.useStore.setState({ explorerIsOpened: false })}>
            <PanelLeftCloseIcon />
          </ButtonComponent>
        </div>

        {/* Right icons */}
        <div className="flex ml-auto items-center gap-3 sm:gap-2">
          <ButtonComponent
            className="CreateNewDocument"
            onClick={() => {
              TreeRoAPI.insertNewDocument(rootGroupId, "New Document", 0);
            }}
          >
            <FilePlusIcon />
          </ButtonComponent>
          <ButtonComponent
            className="CreateNewGroup"
            onClick={() => {
              TreeRoAPI.insertNewGroup(rootGroupId, "New Folder", 0);
            }}
          >
            <FolderPlusIcon />
          </ButtonComponent>
          <ButtonComponent
            className="SearchInExplorer"
            onClick={() => {
              console.debug(`onClick`);
              TreeRoAPI.useStore.setState({ globalSearchIsOpened: !globalSearchIsOpened });
            }}
          >
            <SearchIcon />
          </ButtonComponent>
          <div></div>
        </div>
      </div>
    </div>
  );
}

function BottomNavBarComponent() {
  const explorerIsOpened = useStore((state) => state.explorerIsOpened);

  return (
    <div
      className="fixed left-0 bottom-0 min-h-12 sm:min-h-8
                 bg-white shadow-[0_-1px_5px_rgba(0,0,0,0.15)]
                 flex items-center"
      style={{ width: `${explorerIsOpened ? "var(--sidebar-width)" : "0px"}`, paddingBottom: "env(safe-area-inset-bottom)" }}
    ></div>
  );
}

export default function ExplorerComponent() {
  const [activeId, setActiveId] = useState("");

  // const onResize = (w: number) => {
  //   document.documentElement.style.setProperty("--sidebar-width", `${w}px`);
  // };

  const explorerIsOpened = useStore((state) => state.explorerIsOpened);

  const rootGroup = useStore((state) => {
    if (!TreeRoAPI.useStore.getState().stateIsInitialized) return null;
    const rootGroupId = TreeRoAPI.getRootGroupId();
    // console.debug("rootGroupId", rootGroupId)
    if (!rootGroupId) return null;
    return state.groups.get(rootGroupId);
  });

  if (!rootGroup) return null;

  // console.debug("rootGroup", rootGroup);

  return (
    <>
      {explorerIsOpened && (
        <div className="fixed inset-0 bg-black/30 z-50 sm:hidden" onClick={() => TreeRoAPI.useStore.setState({ explorerIsOpened: false })} />
      )}

      <aside
        className={`Explorer relative z-75
                 bg-white shadow-[1px_0px_5px_rgba(0,0,0,0.15)]
                   ${explorerIsOpened ? "" : "hidden"}`}
        style={{ width: "var(--sidebar-width)", minWidth: "var(--sidebar-width)" }}
        onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside modal
      >
        <NavBarComponent />
        <div
          className="Explorer-scroll h-[calc(100dvh-6.1rem)] sm:h-[calc(100dvh-4rem)]
                        mt-12 sm:mt-8
                        pb-10
                        overflow-y-auto overscroll-y-contain"
        >
          <div>
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
                // console.debug("onDragEnd", event);
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

                // console.debug(`Move %c${activeId}%c over %c${overId}%c`, "color: red;", "", "color: red;", "");
                if (activeDocument && overDocument) {
                  if (placement === "after") {
                    // console.debug("moveDocumentAfter", placement);
                    TreeRoAPI.moveDocumentAfter(activeId, overId);
                  } else if (placement === "before") {
                    // console.debug("moveDocumentBefore", placement);
                    TreeRoAPI.moveDocumentBefore(activeId, overId);
                  } else if (placement === "inside") {
                    // console.debug("moveDocumentAfter", placement);
                    TreeRoAPI.moveDocumentAfter(activeId, overId);
                  }
                } else if (activeDocument && overGroup) {
                  if (placement === "after") {
                    // console.debug("moveDocumentAfter", placement);
                    TreeRoAPI.moveDocumentAfter(activeId, overId);
                  } else if (placement === "before") {
                    // console.debug("moveDocumentBefore", placement);
                    TreeRoAPI.moveDocumentBefore(activeId, overId);
                  } else if (placement === "inside") {
                    if (overGroup.collapsed === false && overGroup.children.length !== 0) {
                      // console.debug("moveDocument", placement, 0);
                      TreeRoAPI.moveDocument(activeId, overId, 0);
                    } else {
                      // console.debug("moveDocument", placement, -1);
                      TreeRoAPI.moveDocument(activeId, overId, -1);
                    }
                  }
                } else if (activeGroup && overDocument) {
                  if (placement === "after") {
                    // console.debug("moveGroupAfter", placement);
                    TreeRoAPI.moveGroupAfter(activeId, overId);
                  } else if (placement === "before") {
                    // console.debug("moveGroupBefore", placement);
                    TreeRoAPI.moveGroupBefore(activeId, overId);
                  } else if (placement === "inside") {
                    // console.debug("moveGroupAfter", placement);
                    TreeRoAPI.moveGroupAfter(activeId, overId);
                  }
                } else if (activeGroup && overGroup) {
                  if (placement === "after") {
                    // console.debug("moveGroupAfter", placement);
                    TreeRoAPI.moveGroupAfter(activeId, overId);
                  } else if (placement === "before") {
                    // console.debug("moveGroupBefore", placement);
                    TreeRoAPI.moveGroupBefore(activeId, overId);
                  } else if (placement === "inside") {
                    if (overGroup.collapsed === false && overGroup.children.length !== 0) {
                      // console.debug("moveGroup", placement, 0);
                      TreeRoAPI.moveGroup(activeId, overId, 0);
                    } else {
                      // console.debug("moveGroup", placement, -1);
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
                  <div className="RootGroupChildren flex flex-col gap-1 py-4 pl-5 sm:pl-2 pr-3 sm:pr-2">
                    {rootGroup.children.map((childId) => (
                      <ExplorerItemComponent key={childId} itemId={childId} />
                      // <NodeComponent key={childId} nodeId={childId} />
                    ))}
                    {/* Remember that it is located in the document container so it inherits styles and behaviour */}
                    <DragOverlay>
                      {activeId ? <div className="inline-block border border-black bg-white px-1 cursor-grabbing">Move</div> : null}
                    </DragOverlay>
                  </div>
                </div>
              </div>
            </DnDWrapperComponent>
          </div>
        </div>
        <BottomNavBarComponent />
      </aside>
    </>
  );
}

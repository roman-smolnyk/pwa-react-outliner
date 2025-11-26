// import { EllipsisVertical, Minus, PlusCircle } from "lucide-react";
// import { PlusCircle } from "@phosphor-icons/react";
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
// @ts-ignore TS6133: declared but never read
import { memo, useEffect, useRef, useState } from "react";
import Markdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { TreeRoAPI } from "./api";
import { useStore, useUIStore } from "./stateStore";

const NodeContentComponent = memo(({ nodeId, nodeContent }: { nodeId: string; nodeContent: string }) => {
  const logPrefix = `NodeContentComponent [${nodeId}]`;
  // console.debug(logPrefix);
  const refContenteditable = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    console.log("MOUNTED");
    return () => console.log("UNMOUNTED");
  }, []);

  return (
    <div className="NodeContent-container" data-id={nodeId}>
      <div
        ref={refContenteditable}
        // className={`NodeContent-edit ${node.content ? "trailing-nl" : ""}`}
        className={`NodeContent-edit trailing-nl ${isEditing ? "" : "hidden"}`}
        data-id={nodeId}
        contentEditable
        suppressContentEditableWarning
        tabIndex={-1}
        spellCheck={true}
        autoCorrect="off"
        onPaste={(e) => {
          // console.debug(`${logPrefix} -> onPaste`, e);
          e.preventDefault();
          const text = e.clipboardData.getData("text/plain");
          // document.execCommand("insertText", false, text);
          const selection = window.getSelection();
          if (!selection?.rangeCount) return;
          selection.deleteFromDocument();
          selection.getRangeAt(0).insertNode(document.createTextNode(text));
          // Move caret to end of inserted text
          selection.collapseToEnd();
        }}
        onInput={(e) => {
          // console.debug(`${logPrefix} -> onInput`);
          // const el = ref.current?.querySelector(".NodeContent-edit");
          // console.debug(`${logPrefix} -> NodeContent-edit`, el);
          // if (el) printDOM(el as HTMLElement);
          // printDOM(e.currentTarget);

          // Remove <br> that browser insearts in empty contenteditable
          if (e.currentTarget.innerHTML === "<br>") {
            e.currentTarget.innerHTML = "";
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && e.ctrlKey) {
            // console.debug(`${logPrefix} -> onKeyDown [Enter + ctrlKey]`);
            e.preventDefault();
            const newNode = TreeRoAPI.createNode("");
            TreeRoAPI.insertNodeRelativeTo(newNode, nodeId, 1);
            //
            setTimeout(() => {
              const el = document.querySelector(`[data-id="${newNode.node_id}"] .NodeContent-edit`);
              // console.debug(`${logPrefix} -> placeCaretAtStart`, el);
              if (el) TreeRoAPI.setCaretAtCharIndex(el as HTMLElement, 0);
            }, 0);
          } else if (e.key === "Enter") {
            // console.debug(`${logPrefix} -> onKeyDown [Enter]`);
            e.preventDefault();
            const selection = window.getSelection();
            if (!selection?.rangeCount) return;
            const range = selection.getRangeAt(0);
            // Delete any selected text
            range.deleteContents();
            // create new text node
            const newlineNode = document.createTextNode("\n");
            // Insert the newline at the caret
            range.insertNode(newlineNode);
            // Move caret to end of inserted text
            // Move caret after the newline
            range.setStartAfter(newlineNode);
            range.setEndAfter(newlineNode);
            // Collapse selection to caret
            selection.removeAllRanges();
            selection.addRange(range);
          } else if (e.key === "Backspace") {
            // console.debug(`${logPrefix} -> onKeyDown [Backspace]`);
            const text = e.currentTarget.textContent ?? "";
            if (text.length === 0) {
              e.preventDefault(); // stop browser default
              const siblingNode = TreeRoAPI.getNodeSibling(nodeId, -1);
              TreeRoAPI.deleteNode(nodeId);
              if (siblingNode) {
                setTimeout(() => {
                  const el = document.querySelector(`.NodeContent-edit[data-id="${siblingNode.node_id}"]`);
                  // console.debug(`${logPrefix} -> placeCaretAtStart`, el);
                  if (el) TreeRoAPI.setCaretAtCharIndex(el as HTMLElement, 0);
                }, 0);
              }
            }
          } else if (e.key === "Tab" && e.shiftKey) {
            // console.debug(`${logPrefix} -> onKeyDown [Tab + shiftKey]`, e.key, e.shiftKey);
            e.preventDefault(); // block default focus change
            const nodeParent = TreeRoAPI.getNodeParent(nodeId);
            if (!nodeParent) return;
            // console.debug(`${logPrefix} -> onKeyDown [Tab + shiftKey]`, nodeParent);
            e.currentTarget.blur();
            TreeRoAPI.moveNodeRelativeTo(nodeId, nodeParent.node_id, 1);
          } else if (e.key === "Tab") {
            // console.debug(`${logPrefix} -> onKeyDown [Tab]`, e.key, e.shiftKey);
            e.preventDefault(); // block default focus change
            // const currentElement = e.currentTarget;
            const siblingNode = TreeRoAPI.getNodeSibling(nodeId, -1);
            if (!siblingNode) return;
            e.currentTarget.blur();
            TreeRoAPI.moveNode(nodeId, siblingNode.node_id);
            // const newNodeParent = TreeRoAPI.getNodeParent(node.node_id);
            TreeRoAPI.updateNode(siblingNode.node_id, { collapsed: false });
            // setTimeout(() => {
            //   setIsEditing(true);
            //   // currentElement.focus();
            // }, 100);
          } else if (e.key === "ArrowUp" && e.ctrlKey && !e.shiftKey) {
            e.preventDefault();
            const nodeParent = TreeRoAPI.getNodeParent(nodeId)!;
            const index = TreeRoAPI.getNodeIndex(nodeId)!;
            TreeRoAPI.moveNode(nodeId, nodeParent.node_id, index - 1);
          } else if (e.key === "ArrowDown" && e.ctrlKey && !e.shiftKey) {
            e.preventDefault();
            const nodeParent = TreeRoAPI.getNodeParent(nodeId)!;
            const index = TreeRoAPI.getNodeIndex(nodeId)!;
            TreeRoAPI.moveNode(nodeId, nodeParent.node_id, index + 1);
          }
        }}
        onBlur={(e) => {
          console.debug(`${logPrefix} -> onBlur`);
          // const newContent = getPlainTextWithNewlines(e.currentTarget);
          const newContent = e.currentTarget.textContent || "";
          // const newContent = e.currentTarget.textContent ?? "";
          // console.debug(`${logPrefix} -> onBlur`, newContent);
          if (newContent !== nodeContent) {
            TreeRoAPI.updateNode(nodeId, { content: newContent });
          }
          setIsEditing(false);
        }}
      >
        {nodeContent}
      </div>
      {
        <div
          className={`NodeContent-render  ${isEditing ? "hidden" : ""}`}
          data-id={nodeId}
          onPointerDown={(e) => {
            // console.log(`${logPrefix} -> onPointerDown`);
            const charIndex = TreeRoAPI.getCharIndexFromMouse(e.currentTarget, e.clientX, e.clientY);
            // console.log(`${logPrefix} -> onMouseDown -> charIndex`, charIndex);
            setIsEditing(true);
            setTimeout(() => {
              // console.log(`onPointerDown setTimeout -> charIndex`, charIndex);
              TreeRoAPI.setCaretAtCharIndex(refContenteditable.current as HTMLElement, charIndex);
            }, 100);
          }}
          // onMouseUp={() => console.log(`${logPrefix} -> onMouseUp`)}
          // onClick={(e) => {
          //   const charIndex = TreeRoAPI.getCharIndexFromCaret(e.currentTarget);
          //   console.log(`onClick -> charIndex`, charIndex);
          // }}
        >
          <Markdown
            remarkPlugins={[remarkGfm, remarkBreaks, remarkMath]}
            rehypePlugins={[rehypeRaw, rehypeKatex]}
            components={{
              input(props) {
                // Always normalize checked to boolean
                const { checked, ...rest } = props;
                return <input {...rest} checked={!!checked} readOnly />;
              },
              code(props) {
                // @ts-ignore TS6133: declared but never read
                const { children, className, ...rest } = props;
                // console.info("className", className);
                // console.info("children", children);
                // console.info("rest", rest);

                const match = /language-(\w+)/.exec(className || "");
                const codeString = String(children).replace(/\n$/, "");

                // const CustomDiv = (props) => <div className="p-2! rounded-lg" {...props} />;

                return match ? (
                  <div className="relative">
                    <ButtonCopyCodeComponent textToCopy={codeString} />
                    {/* showLineNumbers */}
                    <SyntaxHighlighter PreTag={SyntaxHighlighterPreTagComponent} language={match[1]}>
                      {codeString}
                    </SyntaxHighlighter>
                  </div>
                ) : (
                  <code className={`${className} px-1 rounded-md text-red-600 bg-gray-100`}>{children}</code>
                );
              },
            }}
          >
            {nodeContent}
          </Markdown>
        </div>
      }
    </div>
  );
});

const ButtonCopyCodeComponent = ({ textToCopy }: { textToCopy: string }) => {
  return (
    <button
      onPointerDown={async (e) => {
        console.debug("onPointerDown -> Copy");
        e.preventDefault();
        e.stopPropagation();
        try {
          await navigator.clipboard.writeText(textToCopy);
        } catch (err) {
          console.error("Failed to copy:", err);
        }
      }}
      type="button"
      className="cursor-pointer absolute top-1 right-1 px-2 p-1
                 text-xs rounded-md 
                opacity-0 hover:opacity-100 transition-opacity 
                 border border-gray-400 bg-white"
    >
      Copy
    </button>
  );
};

// @ts-ignore TS7006: Parameter 'props' implicitly has an 'any' type.
const SyntaxHighlighterPreTagComponent = (props) => {
  return (
    <div
      className="p-2! rounded-lg"
      {...props}
      onPointerDownCapture={(event) => {
        console.debug("onPointerDown DIV");
        const el = event.currentTarget;
        const rect = el.getBoundingClientRect();

        const scrollbarX = event.clientY > rect.bottom - 16; // horizontal scrollbar height
        const scrollbarY = event.clientX > rect.right - 16; // vertical scrollbar width

        if (scrollbarX || scrollbarY) {
          console.debug("stopPropagation");
          // User is interacting with the scrollbar → don't toggle edit mode
          event.stopPropagation();
        }
      }}
    />
  );
};

const NodeComponent = memo(({ nodeId }: { nodeId: string }) => {
  // @ts-ignore TS6133: declared but never read
  const logPrefix = `NodeComponent [${nodeId}]`;
  // console.debug(logPrefix);
  const refNode = useRef<HTMLDivElement>(null);

  // zustand subscribe to node
  const node = useStore((state) => {
    return state.nodes.get(nodeId);
  });

  // useSortable merges useDraggable and useDroppable functionality, so you can do
  const { attributes, listeners, setNodeRef, isOver, over, active, isDragging } = useSortable({
    id: nodeId,
  });

  if (isDragging) {
    // console.debug("isDragging", attributes, listeners);
  }

  if (isOver) {
    // console.debug("isOver", attributes, listeners);
  }

  // zustand subscribe to rerender trigger
  useStore((state) => {
    return state.rerenderNodesToggle[nodeId];
  });

  let placement = null;
  if (isOver && active?.id && over?.id && active.id !== over.id) {
    if (!useUIStore.getState().draggableNodeDescendantsIds.includes(nodeId)) {
      placement = useUIStore.getState().dragNDropPlacement;
    }
  }

  const combinedRef = (element: HTMLDivElement | null) => {
    setNodeRef(element); // dnd-kit needs this
    refNode.current = element; // your own ref
  };

  if (!node) return null;

  const childNodes = TreeRoAPI.getNodeChildren(node.node_id);

  return (
    // data-id={node.node_id}
    <div ref={combinedRef} id={node.node_id} className={`Node-outer ${isDragging ? "bg-gray-200" : ""}`}>
      <div className="Node-inner">
        {over?.id === node.node_id && placement === "above" && <DropIndicatorComponent />}
        <div className="Node-self" data-id={node.node_id}>
          <button
            className="Node-bullet"
            type="button"
            // ref={setBulletDropRef}
            {...listeners}
            {...attributes}
            // data-node-id={node.id}
            onPointerUpCapture={() => {
              console.debug("Node-bullet onPointerUpCapture");
              TreeRoAPI.toggleNodeCollapse(node.node_id);
            }}
          >
            {node.children.length > 0 ? (
              node.collapsed ? (
                // <PlusIcon className="size-4 text-500" />
                // <PlusCircleIcon className="size-4 text-500 stroke-black" fill="none" />
                // <PlusCircle className="size-4" />
                <i className="ph-bold ph-plus-circle text-[0.85rem]"></i>
                // <i className="ph-bold ph-plus-circle"></i>
                // <div>
                //   <span className="ml-1 w-2 h-2 rounded-full border border-black flex items-center justify-center">
                //     <span className="w-1 h-1 bg-black rounded-full"></span>
                //   </span>
                // </div>
              ) : (
                // <Minus className="size-4" />
                <i className="ph ph-minus text-[0.9rem]"></i>
              )
            ) : (
              // <span>●</span>
              <i className="ph-fill ph-circle text-[0.5rem]"></i>
              // <div>

              //   {/* <span className="ml-1 w-2 h-2 bg-black rounded-full block"></span> */}
              //   {/* <span className="ml-1 w-3 h-3 rounded-full border border-black flex items-center justify-center">
              //     <span className="w-2 h-2 bg-black rounded-full"></span>
              //   </span> */}
              // </div>
            )}
          </button>
          <NodeContentComponent nodeId={node.node_id} nodeContent={node.content} />
          <button className="Node-options" type="button">
            {/* <span>⋮</span> */}
            <i className="ph-bold ph-dots-three-vertical text-[1rem]"></i>
            {/* <EllipsisVertical className="size-4" /> */}
          </button>
          <div className="text-xs">{node.node_id.split("-").pop()}</div>
        </div>
        {over?.id === node.node_id && placement === "below" && <DropIndicatorComponent />}
        {over?.id === node.node_id && placement === "inside" && <DropIndicatorComponent shrink={true} />}
        <div className={`NodeChildren ${node.collapsed ? "hidden!" : ""}`}>
          {childNodes.map((child) => (
            <NodeComponent key={child.node_id} nodeId={child.node_id} />
          ))}
        </div>
      </div>
    </div>
  );
});

export function DropIndicatorComponent({ shrink = false }) {
  // console.debug(placement);
  return (
    <div className="flex items-start justify-end">
      <div className={`h-1 rounded bg-blue-500 ${shrink ? "w-3/4" : "w-full"}`} />
    </div>
  );
}

export default function DocumentComponent() {
  // @ts-ignore TS6133: declared but never read
  const logPrefix = `DocumentComponent`;

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
      // @ts-ignore TS6133: declared but never read
      onDragOver={(event) => {
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
              <div className="Document-bottom-spacer h-100" />
            </div>
          </div>
        </div>
      </div>
    </DndContext>
  );
}

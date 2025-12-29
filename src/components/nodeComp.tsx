// import { EllipsisVertical, Minus, PlusCircle } from "lucide-react";
// import { PlusCircle } from "@phosphor-icons/react";
import { useSortable } from "@dnd-kit/sortable";
import { memo, useRef, useState, useEffect, useLayoutEffect } from "react";
import { TreeRoAPI } from "../api";
import { MarkdownComponent } from "../components/markdownComp";
import { useReadOnly } from "../etc/readonlyContext";
import { useStore } from "../stateStore";
import { NodeOptionsComponent } from "./menusComp";
import { debounce, ENGINE } from "../etc/utilities";

const updateContentDebounced = debounce((nodeId, el: HTMLElement) => {
  // console.debug(`updateContent`, { nodeId, newContent });
  TreeRoAPI.updateNode(nodeId, { content: el.textContent ?? "" });
}, 1_000);

// TODO: Remove sentinel that is in the middle of tghe text, because of cursor that placed afgter sentinel
function ensureSentinel(el: HTMLElement) {
  const last = el.lastChild;

  if (last && last.nodeType === Node.ELEMENT_NODE && (last as HTMLElement).dataset.sentinel !== undefined) {
    return;
  }

  const span = document.createElement("span");
  span.contentEditable = "false";
  span.dataset.sentinel = "";
  span.style.display = "inline-block";
  span.style.width = "0px";
  span.style.height = "0px";

  el.appendChild(span);
}

function clampCaretBeforeSentinel(el: HTMLElement) {
  const sentinel = el.querySelector("[data-sentinel]");
  if (!sentinel) return;

  const sel = window.getSelection();
  if (!sel || !sel.rangeCount) return;

  const range = sel.getRangeAt(0);

  // If caret is after sentinel → move it before
  if (range.startContainer === el && range.startOffset > Array.from(el.childNodes).indexOf(sentinel)) {
    const prev = sentinel.previousSibling;
    if (!prev) return;

    const newRange = document.createRange();

    if (prev.nodeType === Node.TEXT_NODE) {
      newRange.setStart(prev, (prev as Text).length);
    } else {
      newRange.setStartAfter(prev);
    }

    newRange.collapse(true);
    sel.removeAllRanges();
    sel.addRange(newRange);
  }
}

export const NodeContentComponent = memo(({ nodeId, nodeContent }: { nodeId: string; nodeContent: string }) => {
  // console.debug(`NodeContentComponent`, { nodeId });
  const refContenteditable = useRef<HTMLDivElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const { readOnly } = useReadOnly();

  // subscribe
  useStore((state) => {
    return state.nodesContentToRender[nodeId];
  });

  // useEffect(() => {
  //   console.debug(`MOUNTED: NodeContentComponent(${nodeId})`);
  //   return () => console.debug(`MOUNTED2: NodeContentComponent(${nodeId})`);
  // }, []);

  const activeNodeId = useStore.getState().activeNodeId;
  useEffect(() => {
    // console.debug(`useEffect`, { nodeId });
    if (nodeId === activeNodeId) {
      // console.debug(`useEffect (nodeId === activeNodeId)`, { nodeId, activeNodeId });
      // console.debug("activeNodeId", activeNodeId);
      // useStore.setState({ activeNodeId: "" });
      setIsEditing(true);
      setTimeout(() => {
        if (refContenteditable.current) {
          useStore.getState().setCaretAtCharIndex(refContenteditable.current, useStore.getState().currentCaretPosition);
        }
      }, 0);
    }
  }, [nodeId, activeNodeId]);

  useLayoutEffect(() => {
    if (isEditing) return;

    const el = refContenteditable.current;
    if (!el) return;

    console.debug(`useLayoutEffect`, JSON.stringify(nodeContent));

    // ! IMPORTANT: Prevent React replays
    el.innerHTML = "";

    const textNode = document.createTextNode(nodeContent);
    el.appendChild(textNode);

    if (!ENGINE.GECKO) {
      ensureSentinel(el);
      // clampCaretBeforeSentinel(el);
    }
  }, [isEditing, nodeContent]);

  return (
    <div className={`NodeContent-container flex-auto min-w-0 ${isEditing ? "bg-gray-100 shadow-[0_0_10px_5px_#f3f4f6]" : ""}`} data-id={nodeId}>
      {/* // * Add small padding to allow mobile users place cursor at the beggining */}
      <div
        ref={refContenteditable}
        // className={`NodeContent-contenteditable ${node.content ? "trailing-nl" : ""}`}
        className={`NodeContent-contenteditable min-h-5 px-1 cursor-text select-text outline-none 
          whitespace-pre-wrap wrap-break-word leading-tight trailing-nl 
          ${isEditing ? "" : "hidden"}`}
        data-id={nodeId}
        contentEditable
        suppressContentEditableWarning
        tabIndex={-1}
        spellCheck={true}
        autoCorrect="off"
        // Override paste behaviour
        onPaste={(e) => {
          // console.debug(`${logPrefix} -> onPaste`, e);
          e.preventDefault();
          const text = e.clipboardData.getData("text/plain");
          const selection = window.getSelection();
          if (!selection?.rangeCount) return;
          selection.deleteFromDocument();
          selection.getRangeAt(0).insertNode(document.createTextNode(text));
          // Move caret to end of inserted text
          selection.collapseToEnd();
        }}
        onFocus={(e) => {
          const el = e.currentTarget;
          console.debug("onFocus", JSON.stringify(el.textContent));
        }}
        onInput={(e) => {
          const el = e.currentTarget;
          // console.debug("onInput", JSON.stringify(el.textContent));

          // text = text.slice(0, text.length - 1);

          // Remove <br> that browser inserts in the empty contenteditable [Currently it is not empty due to sentinel]
          // if (e.currentTarget.innerHTML === "<br>") {
          //   e.currentTarget.innerHTML = "";
          // }

          if (el.textContent ?? "" !== nodeContent) {
            updateContentDebounced(nodeId, el);
          }
          if (!ENGINE.GECKO) {
            ensureSentinel(refContenteditable.current!);
            // clampCaretBeforeSentinel(refContenteditable.current!);
          }
        }}
        onKeyDown={(e) => {
          console.debug("onKeyDown");
          const el = e.currentTarget;
          // Create new node
          if (e.key === "Enter" && e.ctrlKey) {
            // console.debug(`${logPrefix} -> onKeyDown [Enter + ctrlKey]`);
            e.preventDefault();
            const activeNodeId = TreeRoAPI.useStore.getState().activeNodeId;
            const newNodeId = TreeRoAPI.insertNewNodeAfter(activeNodeId);
            console.debug(`(e.key === "Enter" && e.ctrlKey)`, { activeNodeId, newNodeId });
            if (newNodeId) {
              TreeRoAPI.useStore.getState().activateNode(newNodeId);
            }
            // Override Enter => Insert "\n"
          } else if (e.key === "Enter") {
            // console.debug(`${logPrefix} -> onKeyDown [Enter]`);
            // return;
            console.debug("onKeyDown", JSON.stringify(el.textContent));

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

            console.debug("onKeyDown 2", JSON.stringify(el.textContent));
            // Remove node if empty
          } else if (e.key === "Backspace") {
            // console.debug(`${logPrefix} -> onKeyDown [Backspace]`);
            const text = el.textContent ?? "";
            if (text.length === 0) {
              e.preventDefault(); // stop browser default
              const siblingNode = TreeRoAPI.getNodeSibling(nodeId, -1);
              TreeRoAPI.deleteNode(nodeId);
              if (siblingNode) {
                // console.debug("siblingNode", siblingNode);
                TreeRoAPI.useStore.getState().activateNode(siblingNode.node_id, -1);
                // useUIStore.setState({ activeEditNodeId: siblingNode.node_id });
                // setTimeout(() => {
                //   const el = document.querySelector(`.NodeContent-contenteditable[data-id="${siblingNode.node_id}"]`);
                //   // console.debug(`${logPrefix} -> placeCaretAtStart`, el);
                //   if (el) TreeRoAPI.setCaretAtCharIndex(el as HTMLElement, 0);
                // }, 0);
              }
            }
            // Unindent node
          } else if (e.key === "Tab" && e.shiftKey) {
            // console.debug(`${logPrefix} -> onKeyDown [Tab + shiftKey]`, e.key, e.shiftKey);
            e.preventDefault(); // block default focus change
            el.blur();
            TreeRoAPI.uiUnindentNode(nodeId);
            // Indent node
          } else if (e.key === "Tab") {
            // console.debug(`${logPrefix} -> onKeyDown [Tab]`, e.key, e.shiftKey);
            e.preventDefault(); // block default focus change
            el.blur();
            TreeRoAPI.uiIndentNode(nodeId);
            // Move node up
          } else if (e.key === "ArrowUp" && e.ctrlKey && !e.shiftKey) {
            e.preventDefault();
            TreeRoAPI.uiMoveNodeUp(nodeId);
            // Move node down
          } else if (e.key === "ArrowDown" && e.ctrlKey && !e.shiftKey) {
            // console.debug(`(e.key === "ArrowDown" && e.ctrlKey && !e.shiftKey)`);
            e.preventDefault();
            TreeRoAPI.uiMoveNodeDown(nodeId);
          }

          if (el.textContent ?? "" !== nodeContent) {
            updateContentDebounced(nodeId, el);
          }
          if (!ENGINE.GECKO) {
            ensureSentinel(refContenteditable.current!);
            // clampCaretBeforeSentinel(refContenteditable.current!);
          }
        }}
        // On lost focus update
        onBlur={(e) => {
          // console.debug(`onBlur`);
          const el = e.currentTarget;
          console.debug("onBlur", JSON.stringify(el.textContent));

          if (el.textContent !== nodeContent) {
            TreeRoAPI.updateNode(nodeId, { content: el.textContent ?? "" });
          }
          setIsEditing(false);
          if (TreeRoAPI.useStore.getState().activeNodeId === nodeId) {
            useStore.setState({ activeNodeId: "" });
          }
        }}
      ></div>
      {
        <div
          className={`NodeContent-render wrap-break-word min-h-5 px-1 ${isEditing ? "hidden" : ""} ${readOnly ? "cursor-default" : "cursor-text"}`}
          data-id={nodeId}
          onPointerDown={(e) => {
            console.debug("onPointerDown", e.currentTarget.innerHTML);
            if (readOnly) return;
            if (e.pointerType === "touch") {
              // isTouch = true;
              // pointerStart = { x: e.clientX, y: e.clientY };
            } else {
              const charIndex = useStore.getState().getCharIndexFromMouse(e.currentTarget, e.clientX, e.clientY);
              useStore.getState().activateNode(nodeId, charIndex);
            }
          }}
          onPointerUp={(e) => {
            if (readOnly) return;
            if (e.pointerType === "touch") {
              const charIndex = useStore.getState().getCharIndexFromMouse(e.currentTarget, e.clientX, e.clientY);
              setIsEditing(true);
              useStore.setState({ activeNodeId: nodeId });
              setTimeout(() => {
                useStore.getState().setCaretAtCharIndex(refContenteditable.current as HTMLElement, charIndex);
              }, 100);
            }
          }}
          // onMouseUp={() => console.log(`${logPrefix} -> onMouseUp`)}
          // onClick={(e) => {
          //   const charIndex = TreeRoAPI.getCharIndexFromCaret(e.currentTarget);
          //   console.log(`onClick -> charIndex`, charIndex);
          // }}
        >
          <MarkdownComponent>{nodeContent}</MarkdownComponent>
        </div>
      }
    </div>
  );
});

export const NodeComponent = memo(({ nodeId }: { nodeId: string }) => {
  // console.debug(`NodeComponent: ${nodeId}`);
  const ref = useRef<HTMLDivElement>(null);
  const refNodeSelf = useRef<HTMLDivElement>(null);

  // zustand subscribe
  const node = useStore((state) => {
    return state.nodes.get(nodeId);
  });

  // zustand subscribe to rerender trigger
  useStore((state) => {
    return state.nodesToRender[nodeId];
  });

  useStore((state) => {
    return state.dndToRerender[nodeId];
  });

  const { readOnly } = useReadOnly();

  // useSortable merges useDraggable and useDroppable functionality, so you can do
  const { setNodeRef, attributes, listeners, active, over, isDragging, isOver } = useSortable({
    id: nodeId,
    disabled: readOnly,
  });

  const combinedRef = (element: HTMLDivElement | null) => {
    setNodeRef(element); // dnd-kit needs this
    ref.current = element; // your own ref
  };

  if (isDragging) {
    // console.debug("isDragging", attributes, listeners);
    const descendantsIds = TreeRoAPI.getNodeDescendantsIds(nodeId);
    useStore.setState({ dndDescendantsIds: descendantsIds });
  }

  let placement = null;
  if (isOver) {
    // console.debug("isOver", attributes, listeners);
    TreeRoAPI.useStore.setState({ dndRectEl: refNodeSelf.current });
    if (active?.id && over?.id && active.id !== over.id) {
      if (!useStore.getState().dndDescendantsIds.includes(nodeId)) {
        placement = TreeRoAPI.useStore.getState().dndPlacement;
      }
    }
  }

  if (!node) return null;

  return (
    // data-id={node.node_id}
    <div id={node.node_id} className={`Node-outer ${isDragging ? "bg-gray-200" : ""}`} ref={combinedRef}>
      <div className="Node-inner">
        {over?.id === node.node_id && placement === "before" && <DropIndicatorComponent />}
        <div className="Node-self flex items-start" ref={refNodeSelf} data-id={node.node_id}>
          <button
            className="Node-bullet flex flex-none items-center justify-center cursor-pointer min-h-5 min-w-5"
            type="button"
            // ref={setBulletDropRef}
            {...listeners}
            {...attributes}
            // data-node-id={node.id}
            onPointerUpCapture={() => {
              // console.debug("Node-bullet onPointerUpCapture");
              TreeRoAPI.uiToggleNodeCollapse(node.node_id);
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
                // <i className="ph-bold ph-minus-circle text-[0.85rem]"></i>
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
          <NodeOptionsComponent nodeId={nodeId} />
          {/* // ! ID */}
          {/* <div className="NodeDebugId text-xs min-w-10">{nodeId.slice(30)}</div> */}
        </div>
        {over?.id === node.node_id && placement === "after" && <DropIndicatorComponent />}
        {over?.id === node.node_id && placement === "inside" && <DropIndicatorComponent shrink={true} />}
        <div className={`NodeChildren flex flex-col gap-2 border-l border-gray-200 ml-2 pl-5 ${node.collapsed ? "hidden!" : ""}`}>
          {node.children.map((childId) => (
            <NodeComponent key={childId} nodeId={childId} />
          ))}
        </div>
      </div>
    </div>
  );
});

function DropIndicatorComponent({ shrink = false }) {
  // console.debug(placement);
  return (
    <div className="flex items-start justify-end">
      <div className={`h-1 rounded bg-blue-500 ${shrink ? "w-3/4" : "w-full"}`} />
    </div>
  );
}

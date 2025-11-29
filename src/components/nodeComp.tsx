// import { EllipsisVertical, Minus, PlusCircle } from "lucide-react";
// import { PlusCircle } from "@phosphor-icons/react";
import { useSortable } from "@dnd-kit/sortable";
import { memo, useEffect, useRef, useState } from "react";
import { TreeRoAPI } from "../api";
import { MarkdownComponent } from "../components/markdownComp";
import { useStore, useUIStore } from "../stateStore";

export const NodeContentComponent = memo(({ nodeId, nodeContent }: { nodeId: string; nodeContent: string }) => {
  const _logPrefix = `NodeContentComponent [${nodeId}]`;
  // console.debug(logPrefix);
  const refContenteditable = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);

  // zustand subscribe to rerender trigger
  useUIStore((state) => {
    return state.nodesContentToRender[nodeId];
  });

  // useEffect(() => {
  //   console.debug(`${_logPrefix} -> MOUNTED`);
  //   return () => console.debug(`${_logPrefix} -> MOUNTED`);
  // }, []);

  const activeEditNodeId = useUIStore.getState().activeEditNodeId;
  if (nodeId === activeEditNodeId) {
    console.debug("activeEditNodeId", activeEditNodeId);
    useUIStore.setState({ activeEditNodeId: "" });
    setIsEditing(true);
    setTimeout(() => {
      if (refContenteditable.current) {
        TreeRoAPI.setCaretAtCharIndex(refContenteditable.current, useUIStore.getState().activeEditCaretPosition);
      }
    }, 0);
  }

  return (
    <div className={`NodeContent-container  ${isEditing ? "bg-gray-100" : ""}`} data-id={nodeId}>
      <div
        ref={refContenteditable}
        // className={`NodeContent-contenteditable ${node.content ? "trailing-nl" : ""}`}
        className={`NodeContent-contenteditable trailing-nl ${isEditing ? "" : "hidden"}`}
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
          // const el = ref.current?.querySelector(".NodeContent-contenteditable");
          // console.debug(`${logPrefix} -> NodeContent-contenteditable`, el);
          // if (el) printDOM(el as HTMLElement);
          // printDOM(e.currentTarget);

          // Remove <br> that browser insearts in the empty contenteditable
          if (e.currentTarget.innerHTML === "<br>") {
            e.currentTarget.innerHTML = "";
          }
        }}
        onKeyDown={(e) => {
          // Create new node
          if (e.key === "Enter" && e.ctrlKey) {
            // console.debug(`${logPrefix} -> onKeyDown [Enter + ctrlKey]`);
            e.preventDefault();
            const newNode = TreeRoAPI.createNode("");
            TreeRoAPI.insertNodeAfter(newNode, nodeId);
            TreeRoAPI.activateNodeEdit(newNode.node_id);
            // useUIStore.setState({ activeEditNodeId: newNode.node_id });
            //
            // setTimeout(() => {
            //   const el: HTMLDivElement | null = document.querySelector(`.NodeContent-contenteditable[data-id="${newNode.node_id}"]`);
            //   console.debug(`${_logPrefix} -> setCaretAtCharIndex`, el);
            //   if (el) TreeRoAPI.setCaretAtCharIndex(el as HTMLElement, 0);
            // }, 0);
            // Override Enter => Insert "\n"
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
            // Remove node if empty
          } else if (e.key === "Backspace") {
            // console.debug(`${logPrefix} -> onKeyDown [Backspace]`);
            const text = e.currentTarget.textContent ?? "";
            if (text.length === 0) {
              e.preventDefault(); // stop browser default
              const siblingNode = TreeRoAPI.getNodeSibling(nodeId, -1);
              TreeRoAPI.deleteNode(nodeId);
              if (siblingNode) {
                console.debug("siblingNode", siblingNode);
                TreeRoAPI.activateNodeEdit(siblingNode.node_id, -1);
                // useUIStore.setState({ activeEditNodeId: siblingNode.node_id });
                // useUIStore.getState().triggerNodeRender(siblingNode.node_id);
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
            const nodeParent = TreeRoAPI.getNodeParent(nodeId);
            if (!nodeParent) return;
            // console.debug(`${logPrefix} -> onKeyDown [Tab + shiftKey]`, nodeParent);
            e.currentTarget.blur();
            TreeRoAPI.moveNodeAfter(nodeId, nodeParent.node_id);
            const index = TreeRoAPI.getCharIndexFromCaret(refContenteditable.current as HTMLElement);
            TreeRoAPI.activateNodeEdit(nodeId, index);
            // Indent node
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
            const index = TreeRoAPI.getCharIndexFromCaret(refContenteditable.current as HTMLElement);
            TreeRoAPI.activateNodeEdit(nodeId, index);
            // Move node up
          } else if (e.key === "ArrowUp" && e.ctrlKey && !e.shiftKey) {
            e.preventDefault();
            const nodeParent = TreeRoAPI.getNodeParent(nodeId)!;
            const index = TreeRoAPI.getNodeIndex(nodeId)!;
            TreeRoAPI.moveNode(nodeId, nodeParent.node_id, Math.max(0, index - 1));
            // Move node down
          } else if (e.key === "ArrowDown" && e.ctrlKey && !e.shiftKey) {
            e.preventDefault();
            const nodeParent = TreeRoAPI.getNodeParent(nodeId)!;
            const index = TreeRoAPI.getNodeIndex(nodeId)!;
            TreeRoAPI.moveNode(nodeId, nodeParent.node_id, index + 1);
          }
        }}
        // On lost focus update
        onBlur={(e) => {
          console.debug(`${_logPrefix} -> onBlur`);
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
          <MarkdownComponent>{nodeContent}</MarkdownComponent>
        </div>
      }
    </div>
  );
});

export const NodeComponent = memo(({ nodeId }: { nodeId: string }) => {
  const _logPrefix = `NodeComponent [${nodeId}]`;
  // console.debug(logPrefix);
  const refNode = useRef<HTMLDivElement>(null);

  // zustand subscribe
  const node = useStore((state) => {
    return state.nodes.get(nodeId);
  });

  // zustand subscribe to rerender trigger
  useUIStore((state) => {
    return state.nodesToRender[nodeId];
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
        {over?.id === node.node_id && placement === "before" && <DropIndicatorComponent />}
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
          <button className="Node-options" type="button">
            {/* <span>⋮</span> */}
            <i className="ph-bold ph-dots-three-vertical text-[1rem]"></i>
            {/* <EllipsisVertical className="size-4" /> */}
          </button>
          <div className="NodeDebugId text-xs">{node.node_id.split("-").pop()}</div>
        </div>
        {over?.id === node.node_id && placement === "after" && <DropIndicatorComponent />}
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

function DropIndicatorComponent({ shrink = false }) {
  // console.debug(placement);
  return (
    <div className="flex items-start justify-end">
      <div className={`h-1 rounded bg-blue-500 ${shrink ? "w-3/4" : "w-full"}`} />
    </div>
  );
}

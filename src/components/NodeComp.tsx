// import { EllipsisVertical, Minus, PlusCircle } from "lucide-react";
// import { PlusCircle } from "@phosphor-icons/react";
import { useSortable } from "@dnd-kit/sortable";
import { memo, useEffect, useLayoutEffect, useRef, useState } from "react";
import { TreeRoAPI } from "../api";
import { useReadOnly } from "../etc/readonlyContext";
import { debounce, inspectDOM } from "../etc/utilities";
import { useStore } from "../stateStore";
import { MarkdownComponent } from "./MarkdownComp";
import { NodeOptionsButtonComponent } from "./MenusComp";

function scrollCaretIntoView() {
  console.debug(`scrollCaretIntoView`);
  const container = document.querySelector(".Document-scroll");
  if (!container) return;
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();

  const vv = window.visualViewport;
  if (!vv) return;

  const visibleBottom = vv.height; // bottom of visible area

  // If caret is below visible area → scroll it up
  if (rect.bottom > visibleBottom) {
    container.scrollBy({
      top: rect.bottom - visibleBottom + 16,
      behavior: "smooth",
    });
  }

  // If caret is above visible area → scroll it down
  if (rect.top < 0) {
    container.scrollBy({
      top: rect.top - 16,
      behavior: "smooth",
    });
  }
}

function updateContent(nodeId: string, nodeContent: string, el: HTMLElement) {
  // console.debug(`updateContent`, { nodeId, newContent });
  let text = el.textContent ?? "";
  if (text.endsWith("\n")) {
    text = text.slice(0, -1);
  }
  if (text !== nodeContent) {
    console.debug(`updateContent`, { nodeId, nodeContent: JSON.stringify(text) });
    TreeRoAPI.updateNode(nodeId, { content: text });
  }
}

const updateContentDebounced = debounce(updateContent, 1_000);

// function ensureSentinel(el: HTMLElement) {
//   removeNonTextNodesFromDOM(el);

//   const last = el.lastChild;

//   if (last && last.nodeType === Node.ELEMENT_NODE && (last as HTMLElement).dataset.sentinel !== undefined) {
//     return;
//   }

//   const span = document.createElement("span");
//   span.contentEditable = "false";
//   span.dataset.sentinel = "";
//   span.style.display = "inline-block";
//   span.style.width = "0px";
//   span.style.height = "0px";

//   el.appendChild(span);
// }

// function selectionInsertNewline() {
//   const selection = window.getSelection();
//   if (!selection?.rangeCount) return;
//   const range = selection.getRangeAt(0);
//   // Delete any selected text
//   range.deleteContents();
//   // create new text node
//   const newlineNode = document.createTextNode("\n");
//   // Insert the newline at the caret
//   range.insertNode(newlineNode);
//   // Move caret to end of inserted text
//   // Move caret after the newline
//   range.setStartAfter(newlineNode);
//   range.setEndAfter(newlineNode);
//   // Collapse selection to caret
//   selection.removeAllRanges();
//   selection.addRange(range);
// }

/*
Contenteditable div on Enter press "inserts" <br>. As I want \n instead of <br> I alter default behaviour but using \n causes several issues:
1) Trailing single \n in any browser does not visually repesented as newline, caret stays at the same place or even visually goes at the beggining of the current line.
2) Browser sanitizes DOM on each click, so Chrome browser removes single trailing "\n" text node. On next Enter click it creates it anyway but it means that double click is required. 

First issue can be fixed by adding newline glyph as :after, so trailing \n will be visually represented as newline. or by always keeping additional \n at the end as Dynalist does.
Second issue can be fixed in the same way as Dynalist does, it always keeps trailing \n in the same #text node. Another way that I have tried is adding <span> sentinel as a last div child. It works but in Firefox it caused caret go under element boundaries.

So as a final solution I took Dynalist hack, to keep trailing \n and ensure it's presence.
*/

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

  useLayoutEffect(() => {
    if (isEditing) return;

    const el = refContenteditable.current;
    if (!el) return;

    // console.debug(`useLayoutEffect`, JSON.stringify(nodeContent));

    // ! IMPORTANT: Prevent React replays
    el.innerHTML = "";

    const textNode = document.createTextNode(nodeContent + "\n");
    el.appendChild(textNode);

    // if (!ENGINE.GECKO) {
    // ensureSentinel(el);
    // clampCaretBeforeSentinel(el);
    // }
  }, [isEditing, nodeContent]);

  useLayoutEffect(() => {
    if (!refContenteditable.current) return;
    // console.debug(`useEffect`, { nodeId });
    if (nodeId === activeNodeId) {
      // console.debug(`useEffect (nodeId === activeNodeId)`, { nodeId, activeNodeId });
      // console.debug("activeNodeId", activeNodeId);
      // useStore.setState({ activeNodeId: "" });
      setIsEditing(true);
      // setTimeout(() => {
      //   useStore.getState().setCaretAtCharIndex(refContenteditable.current!, useStore.getState().currentCaretPosition);
      // }, 0);
      requestAnimationFrame(() => {
        useStore.getState().setCaretAtCharIndex(refContenteditable.current!, useStore.getState().currentCaretPosition);
        // safeScroll();
        scrollCaretIntoView();
      });
    }
  }, [nodeId, activeNodeId]);

  const isRootNode = Boolean(TreeRoAPI.getNode(nodeId)?.parent_id === null);

  return (
    <div className={`NodeContent-container flex-auto min-w-0 ${isEditing ? "bg-gray-100 shadow-[0_0_10px_5px_#f3f4f6]" : ""}`} data-id={nodeId}>
      {/* // * Add small padding to allow mobile users place cursor at the beggining */}
      <div
        ref={refContenteditable}
        // className={`NodeContent-contenteditable ${node.content ? "trailing-nl" : ""}`}
        className={`NodeContent-contenteditable min-h-5 px-1 cursor-text select-text outline-none 
          whitespace-pre-wrap wrap-break-word leading-tight
          ${isEditing ? "" : "hidden"}`}
        data-id={nodeId}
        contentEditable
        suppressContentEditableWarning
        tabIndex={-1}
        spellCheck={true}
        autoCorrect="off"
        // Override paste behaviour
        onPointerUp={() => {
          // const el = e.currentTarget;
          // console.debug("onPointerUp", inspectDOM(inspectCaret(el)));
          // console.debug("onPointerUp", JSON.stringify(el.innerHTML));
          // console.debug("isCursorAtEnd", isCursorAtEnd(el));
          // console.debug("innerHTMLWithCaret", JSON.stringify(innerHTMLWithCaret(el)));
          // console.debug(`onPointerUp`, getCaretRelativeToSpan(e.currentTarget.querySelector("span")!));
        }}
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
        onFocus={() => {
          // const el = e.currentTarget;
          // console.debug("onFocus", JSON.stringify(el.innerHTML));
        }}
        onPointerDown={(e) => {
          const el = e.currentTarget;
          console.debug("onPointerDown", inspectDOM(el));
        }}
        onKeyDown={(e) => {
          // console.debug(`onKeyDown`, e);
          const el = e.currentTarget;
          const textContent = el.textContent ?? "";

          // const selection = window.getSelection();
          // if (!selection?.rangeCount) return;
          // const range = selection.getRangeAt(0);
          // const offset = range.startOffset;

          console.debug("onKeyDown(s)", inspectDOM(el));

          // Create new node
          if (e.key === "Enter" && e.ctrlKey) {
            // console.debug(`${logPrefix} -> onKeyDown [Enter + ctrlKey]`);
            e.preventDefault();
            let newNodeId = null;
            if (isRootNode) {
              newNodeId = TreeRoAPI.insertNewNode(nodeId, "", 0);
            } else {
              const activeNodeId = TreeRoAPI.useStore.getState().activeNodeId;
              newNodeId = TreeRoAPI.insertNewNodeAfter(activeNodeId);
            }

            // console.debug(`(e.key === "Enter" && e.ctrlKey)`, { activeNodeId, newNodeId });
            if (newNodeId) {
              TreeRoAPI.useStore.getState().activateNode(newNodeId);
            }
            // Override Enter => Insert "\n"
          } else if (e.key === "Enter") {
            // console.debug(`${logPrefix} -> onKeyDown [Enter]`);
            // return;
            // e.preventDefault();
            // Remove node if empty
          } else if (e.key === "Backspace") {
            // console.debug(`${logPrefix} -> onKeyDown [Backspace]`);

            if (!isRootNode && (textContent.length === 0 || textContent === "\n")) {
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

            // if (!e.currentTarget?.textContent?.endsWith("\n")) {
            //   console.debug("ZZZZZZ");
            //   if (el.firstChild) {
            //     el.firstChild.textContent = e.currentTarget.textContent + "\n";
            //     TreeRoAPI.useStore.getState().setCaretAtCharIndex(el, offset);
            //   }
            // }
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

          updateContentDebounced(nodeId, nodeContent, el);
        }}
        onBeforeInput={(e) => {
          // console.debug(`onBeforeInput`, e);
          const el = e.currentTarget;
          const selection = window.getSelection();
          if (!selection?.rangeCount) return;
          const range = selection.getRangeAt(0);
          range.deleteContents();
          // const container = range.startContainer;
          const offset = range.startOffset;
          let textContent = el.textContent ?? "";
          if (!textContent.endsWith("\n")) {
            textContent = textContent + "\n";
          }
          const left = textContent.slice(0, offset);
          const right = textContent.slice(offset);
          // console.debug("el.firstChild", el.firstChild);
          if (el.firstChild?.textContent) {
            e.preventDefault();
            el.firstChild.textContent = `${left}${e.data}${right}`;
            TreeRoAPI.useStore.getState().setCaretAtCharIndex(el, offset + 1);
          } else {
            e.preventDefault();
            range.insertNode(document.createTextNode(`${e.data}\n`));
            range.collapse(false);
            // Collapse selection to caret
            selection.removeAllRanges();
            selection.addRange(range);
          }

          // if (e.data === "\n") {
          //   // console.debug(`onBeforeInput`);
          //   e.preventDefault();
          //   selectionInsertNewline();
          //   // insertTextAtCharIndex(el, TreeRoAPI.useStore.getState().getCharIndexFromCaret(el), "\n");
          // }
          console.debug("onBeforeInput(end)", inspectDOM(el));
        }}
        onInput={(e) => {
          console.debug(`onInput`, e);
          const el = e.currentTarget;
          // if ((e.nativeEvent as InputEvent).inputType === "insertParagraph") {
          //   e.preventDefault();
          // }
          // Remove <br> that browser inserts in the empty contenteditable
          if (e.currentTarget.innerHTML === "<br>") {
            console.debug(`e.currentTarget.innerHTML === "<br>"`);
            e.currentTarget.innerHTML = "";
          }
          console.debug("onInput(end)", inspectDOM(el));
        }}
        onKeyUp={(e) => {
          const el = e.currentTarget;
          // const textContent = el.textContent ?? "";

          const selection = window.getSelection();
          if (!selection?.rangeCount) return;
          const range = selection.getRangeAt(0);
          const offset = range.startOffset;

          if (!e.currentTarget?.textContent?.endsWith("\n")) {
            if (el.firstChild) {
              console.debug("ZZZZZZ");
              el.firstChild.textContent = e.currentTarget.textContent + "\n";
              TreeRoAPI.useStore.getState().setCaretAtCharIndex(el, offset);
            }
          }

          console.debug("onKeyUp", inspectDOM(el));
        }}
        // On lost focus update
        onBlur={(e) => {
          // console.debug(`onBlur`);
          const el = e.currentTarget;

          updateContent(nodeId, nodeContent, el);
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
            // console.debug("onPointerDown", e.currentTarget.innerHTML);
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
          {/* <MarkdownWebWorkerComponent>{nodeContent}</MarkdownWebWorkerComponent> */}
        </div>
      }
    </div>
  );
});
NodeContentComponent.displayName = "NodeContentComponent";

// export const NodeComponent = memo(
//   ({ nodeId, parentChecked, parentCollapsed }: { nodeId: string; parentChecked: boolean; parentCollapsed: boolean }) => {
export function NodeComponent({ nodeId, parentChecked, parentCollapsed }: { nodeId: string; parentChecked: boolean; parentCollapsed: boolean }) {
  // console.debug("NodeComponent");
  console.debug(`NodeComponent: ${nodeId}`);
  const ref = useRef<HTMLDivElement>(null);
  const refNodeSelf = useRef<HTMLDivElement>(null);

  const [checked, setChecked] = useState(parentChecked);
  // useEffect(() => {
  //   setChecked(parentChecked);
  // }, [parentChecked]);

  const [visiable, setVisiable] = useState(!parentCollapsed);
  useEffect(() => {
    if (visiable === false && parentCollapsed === false) {
      setVisiable(true);
    }
  }, [visiable, parentCollapsed]);

  // if (parentChecked) {
  //   setChecked(true);
  // } else {
  //   setChecked(false);
  // }

  // zustand subscribe
  const node = useStore((state) => {
    return state.nodes.get(nodeId);
  });

  const checkboxSelectionIsActive = useStore((state) => {
    return state.checkboxSelectionIsActive;
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

  useEffect(() => {
    if (isDragging) {
      // console.debug("isDragging", attributes, listeners);
      const descendantsIds = TreeRoAPI.getNodeDescendantsIds(nodeId);
      useStore.setState({ dndDescendantsIds: descendantsIds });
    }
  }, [active, isDragging]);

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

  // if (!visiable) {
  //   return <div className="Node-placeholder">Item is loading...</div>;
  // }

  return (
    // data-id={node.node_id}
    <div id={node.node_id} className={`Node-outer ${isDragging || checked ? "bg-gray-200" : ""}`} ref={combinedRef}>
      <div className="Node-inner">
        {over?.id === node.node_id && placement === "before" && <DropIndicatorComponent />}
        {/* shadow-[0_-2px_0_0_rgba(59,130,246,1)] */}
        <div className={`Node-self flex items-start`} ref={refNodeSelf} data-id={node.node_id}>
          {checkboxSelectionIsActive && (
            <button
              className="Node-checkbox flex flex-none items-center justify-center cursor-pointer size-5"
              type="button"
              onPointerUpCapture={() => {
                setChecked(!checked);
              }}
            >
              {checked ? <i className="ph ph-check-square text-[1.2rem]" /> : <i className="ph ph-square text-[1.2rem]" />}
            </button>
          )}
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
                // <i className="ph-bold ph-plus-circle text-[0.85rem]"></i>
                // <i className="tro tro-bullet-plus text-[0.7rem] [-webkit-text-stroke:0.2px_black]"></i>
                <i className="tro tro-bullet-plus-bold text-[0.75rem]"></i>
                // <i className="tro tro-bullet-plus text-[0.7rem]"></i>
                // <i className="tro tro-donut text-[0.7rem]"></i>
                // <i className="ph-bold ph-plus-circle"></i>
                // <div>
                //   <span className="ml-1 w-2 h-2 rounded-full border border-black flex items-center justify-center">
                //     <span className="w-1 h-1 bg-black rounded-full"></span>
                //   </span>
                // </div>
              ) : (
                // <Minus className="size-4" />
                // <i className="ph ph-minus text-[0.9rem]"></i>
                <i className="tro tro-minus text-[0.7rem]"></i>
                // <i className="ph-bold ph-minus-circle text-[0.85rem]"></i>
              )
            ) : (
              // <span>●</span>
              // <i className="ph-fill ph-circle text-[0.5rem]"></i>
              <i className="tro tro-bullet text-[0.4rem]"></i>
              // <div>

              //   {/* <span className="ml-1 w-2 h-2 bg-black rounded-full block"></span> */}
              //   {/* <span className="ml-1 w-3 h-3 rounded-full border border-black flex items-center justify-center">
              //     <span className="w-2 h-2 bg-black rounded-full"></span>
              //   </span> */}
              // </div>
            )}
          </button>
          <NodeContentComponent nodeId={node.node_id} nodeContent={node.content} />
          <NodeOptionsButtonComponent nodeId={nodeId} isRootNode={false} />
          {/* <NodeOptionsComponent nodeId={nodeId} /> */}

          {/* // ! ID */}
          {/* <div className="NodeDebugId text-xs min-w-10">{nodeId.slice(-5)}</div> */}
        </div>
        {over?.id === node.node_id && placement === "after" && <DropIndicatorComponent />}
        {over?.id === node.node_id && placement === "inside" && <DropIndicatorComponent shrink={true} />}
        <div className={`NodeChildren flex flex-col gap-2 border-l border-gray-200 ml-2 pl-5 ${node.collapsed ? "hidden!" : ""}`}>
          {node.children.map((childId) => (
            <NodeComponent key={childId} nodeId={childId} parentChecked={checked} parentCollapsed={node.collapsed} />
          ))}
        </div>
      </div>
    </div>
  );
}
// );
// NodeComponent.displayName = "NodeComponent";

// function DropIndicatorComponent({ shrink = false }) {
//   return (
//     <div className="flex items-start justify-end">
//       <div className={`h-1 rounded bg-blue-500 ${shrink ? "w-3/4" : "w-full"}`} />
//     </div>
//   );
// }

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

// import { EllipsisVertical, Minus, PlusCircle } from "lucide-react";
// import { PlusCircle } from "@phosphor-icons/react";

import { memo, useEffect, useRef, useState, useLayoutEffect } from "react";
import Markdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { TreeRoAPI } from "./api";
import { useStore } from "./stateStore";
import { printDOM } from "./utils";

function getCursorIndexInTextContent(container: HTMLElement): number {
  const selection = window.getSelection();
  if (!selection || !selection.anchorNode) return -1;

  let index = 0;
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null);

  while (walker.nextNode()) {
    const node = walker.currentNode as Text;
    if (node === selection.anchorNode) {
      index += selection.anchorOffset;
      break;
    } else {
      index += node.textContent?.length ?? 0;
    }
  }

  return index;
}

function logSplitText(container: HTMLElement) {
  const text = container.textContent ?? "";
  const cursorIndex = getCursorIndexInTextContent(container);

  if (cursorIndex >= 0) {
    const before = text.slice(0, cursorIndex);
    const after = text.slice(cursorIndex);
    console.log("Before:", before);
    console.log("After:", after);
  }
}

function NodeComponent({ nodeId }: { nodeId: string }) {
  const logPrefix = `NodeComponent [${nodeId}]`;
  console.debug(logPrefix);
  const refNode = useRef<HTMLDivElement>(null);
  const refContenteditable = useRef<HTMLDivElement>(null);
  const refRendered = useRef<HTMLDivElement>(null);

  const [isEditing, setIsEditing] = useState(false);

  // zustand subscribe
  const node = useStore((state) => {
    return state.nodes.get(nodeId);
  });

  if (!node) return;

  const childNodes = TreeRoAPI.getNodeChildren(node.node_id);

  return (
    <div ref={refNode} className={`Node-outer`} data-id={node.node_id}>
      <div className="Node-inner">
        <div className="Node-self flex items-start">
          <button
            className="Node-bullet w-4 h-6 cursor-pointer"
            type="button"
            // data-node-id={node.id}
            onClick={() => {
              // console.debug("Node-bullet onClick");
              TreeRoAPI.toggleNodeCollapse(node.node_id);
            }}
          >
            {node.children.length > 0 ? (
              node.collapsed ? (
                // <PlusIcon className="size-4 text-500" />
                // <PlusCircleIcon className="size-4 text-500 stroke-black" fill="none" />
                // <PlusCircle className="size-4" />
                <i className="ph-light ph-plus-circle"></i>
                // <div>
                //   <span className="ml-1 w-2 h-2 rounded-full border border-black flex items-center justify-center">
                //     <span className="w-1 h-1 bg-black rounded-full"></span>
                //   </span>
                // </div>
              ) : (
                // <Minus className="size-4" />
                <i className="ph-light ph-minus"></i>
              )
            ) : (
              // <span>●</span>
              <div>
                <span className="ml-1 w-2 h-2 bg-black rounded-full block"></span>
                {/* <span className="ml-1 w-3 h-3 rounded-full border border-black flex items-center justify-center">
                  <span className="w-2 h-2 bg-black rounded-full"></span>
                </span> */}
              </div>
            )}
          </button>
          <div className="NodeContent-container flex-grow ml-2">
            <div
              ref={refContenteditable}
              // className={`NodeContent-edit ${node.content ? "trailing-nl" : ""}`}
              className={`NodeContent-edit trailing-nl ${isEditing ? "" : "hidden"}`}
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
                printDOM(e.currentTarget);

                // Remove <br> that browser insearts in empty contenteditable
                if (e.currentTarget.innerHTML === "<br>") {
                  e.currentTarget.innerHTML = "";
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.ctrlKey) {
                  // console.debug(`${logPrefix} -> onKeyDown [Enter + ctrlKey]`);
                  e.preventDefault();
                  const newNode = TreeRoAPI.createNode("", true);
                  TreeRoAPI.insertNodeRelativeTo(newNode, node.node_id);
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
                    const siblingNode = TreeRoAPI.getNodeSibling(node.node_id, -1);
                    TreeRoAPI.deleteNode(node.node_id);
                    if (siblingNode) {
                      setTimeout(() => {
                        const el = document.querySelector(`[data-id="${siblingNode.node_id}"] .NodeContent-edit`);
                        // console.debug(`${logPrefix} -> placeCaretAtStart`, el);
                        if (el) TreeRoAPI.setCaretAtCharIndex(el as HTMLElement, 0);
                      }, 0);
                    }
                  }
                } else if (e.key === "Tab" && e.shiftKey) {
                  // console.debug(`${logPrefix} -> onKeyDown [Tab + shiftKey]`, e.key, e.shiftKey);
                  e.preventDefault(); // block default focus change
                  const nodeParent = TreeRoAPI.getNodeParent(node.node_id);
                  if (!nodeParent) return;
                  // console.debug(`${logPrefix} -> onKeyDown [Tab + shiftKey]`, nodeParent);
                  TreeRoAPI.moveNodeRealtiveTo(node.node_id, nodeParent.node_id, 1);
                } else if (e.key === "Tab") {
                  // console.debug(`${logPrefix} -> onKeyDown [Tab]`, e.key, e.shiftKey);
                  e.preventDefault(); // block default focus change
                  const siblingNode = TreeRoAPI.getNodeSibling(node.node_id, -1);
                  if (!siblingNode) return;
                  TreeRoAPI.moveNode(node.node_id, siblingNode.node_id);
                }
              }}
              onBlur={(e) => {
                console.debug(`${logPrefix} -> onBlur`);
                // const newContent = getPlainTextWithNewlines(e.currentTarget);
                const newContent = e.currentTarget.textContent || "";
                // const newContent = e.currentTarget.textContent ?? "";
                // console.debug(`${logPrefix} -> onBlur`, newContent);
                if (newContent !== node.content) {
                  TreeRoAPI.updateNode(node.node_id, { content: newContent });
                }
                setIsEditing(false);
              }}
            >
              {node.content}
            </div>
            {
              <div
                ref={refRendered}
                className={`NodeContent-render cursor-text ${isEditing ? "hidden" : ""}`}
                onMouseDown={(e) => {
                  // console.log(`${logPrefix} -> onMouseDown`);
                  const charIndex = TreeRoAPI.getCharIndexFromMouse(e.currentTarget, e.clientX, e.clientY);
                  // console.log(`${logPrefix} -> onMouseDown -> charIndex`, charIndex);
                  setIsEditing(true);
                  setTimeout(() => {
                    console.log(`onClick setTimeout -> charIndex`, charIndex);
                    TreeRoAPI.setCaretAtCharIndex(refContenteditable.current as HTMLElement, charIndex);
                  }, 100);
                }}
                // onMouseUp={() => console.log(`${logPrefix} -> onMouseUp`)}
                // onClick={(e) => {
                //   const charIndex = TreeRoAPI.getCharIndexFromCaret(e.currentTarget);
                //   console.log(`onClick -> charIndex`, charIndex);
                // }}
              >
                {/* TODO: useMemo */}
                <Markdown
                  remarkPlugins={[remarkGfm, remarkBreaks]}
                  rehypePlugins={[rehypeRaw]}
                  components={{
                    input(props) {
                      // Always normalize checked to boolean
                      const { checked, ...rest } = props;
                      return <input {...rest} checked={!!checked} readOnly />;
                    },
                    code(props) {
                      const { children, className, node, ...rest } = props;
                      // console.info("node", node);
                      // console.info("className", className);
                      // console.info("children", children);
                      // console.info("rest", rest);

                      const match = /language-(\w+)/.exec(className || "");
                      const codeString = String(children).replace(/\n$/, "");
                      // return (match ? (
                      //   <SyntaxHighlighter PreTag="div" language={match[1]}>
                      //     {String(children).replace(/\n$/, "")}
                      //   </SyntaxHighlighter>
                      // ) : (
                      //   <code {...rest} className={className}>
                      //     {children}
                      //   </code>
                      // ))

                      const CustomDiv = (props) => <div className="!p-2 rounded-lg" {...props} />;

                      return match ? (
                        <div style={{ position: "relative" }}>
                          <button
                            onClick={async (e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              try {
                                await navigator.clipboard.writeText(codeString);
                              } catch (err) {
                                console.error("Failed to copy:", err);
                              }
                            }}
                            type="button"
                            className="absolute top-1 right-1 px-2 p-1 text-xs rounded-md opacity-0 
                 hover:opacity-100 transition-opacity cursor-pointer
                 border border-red-400 bg-gray-100"
                          >
                            Copy
                          </button>
                          {/* showLineNumbers */}
                          <SyntaxHighlighter PreTag={CustomDiv} language={match[1]}>
                            {codeString}
                          </SyntaxHighlighter>
                        </div>
                      ) : (
                        <code className={`${className} px-1 rounded-md text-red-600 bg-gray-100`}>{children}</code>
                      );
                    },
                  }}
                >
                  {node.content}
                </Markdown>
              </div>
            }
          </div>
          <button className="Node-options ml-1 cursor-pointer" type="button">
            {/* <span>⋮</span> */}
            <i className="ph-bold ph-dots-three-vertical"></i>
            {/* <EllipsisVertical className="size-4" /> */}
          </button>
        </div>
        <div className={`NodeChildren border-l ml-2 pl-2 ${node.collapsed ? "hidden" : ""}`}>
          {childNodes.map((child) => (
            <MemoizedNodeComponent key={child.node_id} nodeId={child.node_id} />
          ))}
        </div>
      </div>
    </div>
  );
}
const MemoizedNodeComponent = memo(NodeComponent);

export default function DocumentComponent() {
  const logPrefix = `DocumentComponent`;

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

  // console.debug(`${logPrefix} -> meta`, stateIsInitialized, currentDocId);
  console.debug(`${logPrefix} -> rootNode`, rootNode);

  if (!rootNode) return null;

  // const handleClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
  //   const target = e.target as HTMLElement;
  //   const bullet = target.closest<HTMLButtonElement>(".Node-bullet");
  // };

  const childNodes = TreeRoAPI.getNodeChildren(rootNode.node_id);
  // console.debug(`${logPrefix} -> childNodes`, childNodes);

  return (
    <>
      {/* <h1 className="TestTestTest hidden text-3xl font-bold underline m-8">
        Hello world!
      </h1> */}
      <div className="Document mx-2 sm:mx-8 md:mx-16 lg:mx-32 xl:mx-64" data-id={currentDocId}>
        <div className="RootNode-self">
          {/* text-2xl font-bold */}
          <div className="RootNode flex items-start">
            {/* <h1 className="RootNodeContent">{rootNode.content}</h1> */}
            <div contentEditable suppressContentEditableWarning>
              {rootNode.content}
            </div>
          </div>
          <div className="RootNodeChildren">
            {childNodes.map((childNode) => (
              <MemoizedNodeComponent key={childNode.node_id} nodeId={childNode.node_id} />
            ))}
            <div className="h-100" /> {/* spacer */}
          </div>
        </div>
      </div>
    </>
  );
}

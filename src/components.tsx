// import { EllipsisVertical, Minus, PlusCircle } from "lucide-react";
// import { PlusCircle } from "@phosphor-icons/react";
// useRef, useState
import { memo, useEffect, useRef } from "react";
import { useStore } from "./stateStore";

// import { documentSample, outlinerStructureSample } from "./mockupData";

import { printDOM } from "./utils";

import { TreeRoAPI } from "./api";

import Markdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";

import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

function NodeComponent({ nodeId }: { nodeId: string }) {
  const logPrefix = `NodeComponent [${nodeId}]`;
  console.debug(logPrefix);
  const ref = useRef<HTMLDivElement>(null);

  // zustand subscribe
  const node = useStore((state) => {
    return state.nodes.get(nodeId);
  });

  if (!node) return;

  const childNodes = TreeRoAPI.getNodeChildren(node.node_id);

  return (
    <div ref={ref} className={`Node-outer`} data-id={node.node_id}>
      <div className="Node-inner">
        <div className="Node-self flex items-start">
          <button
            className="Node-bullet w-4 h-6"
            type="button"
            // data-node-id={node.id}
            onClick={() => {
              console.debug("Node-bullet onClick");
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
            {/** biome-ignore lint/a11y/noStaticElementInteractions: explanation */}
            <div
              className={`NodeContent-edit ${node.content ? "trailing-nl" : ""}`}
              contentEditable
              suppressContentEditableWarning
              tabIndex={-1}
              spellCheck={true}
              autoCorrect="off"
              onPaste={(e) => {
                console.debug(`${logPrefix} -> onPaste`, e);
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
                console.debug(`${logPrefix} -> onInput`, e);
                const el = ref.current?.querySelector(".NodeContent-edit");
                console.debug(`${logPrefix} -> NodeContent-edit`, el);
                if (el) printDOM(el as HTMLElement);

                // Remove <br> that browser insearts in empty contenteditable
                if (el?.innerHTML === "<br>") {
                  el.innerHTML = "";
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.ctrlKey) {
                  console.debug(`${logPrefix} -> onKeyDown`, e);
                  e.preventDefault();
                  // const newNode = TreeRoAPI.createNode()
                  // TreeRoAPI.addNode()
                  // // Call your API to create a new sibling node
                  // TreeRoAPI.createSiblingNode(node.node_id);
                } else if (e.key === "Enter") {
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
                }
              }}
              onBlur={(e) => {
                console.debug(`${logPrefix} -> onBlur`, e);
                // const newContent = getPlainTextWithNewlines(e.currentTarget);
                const newContent = e.currentTarget.textContent || "";
                // const newContent = e.currentTarget.textContent ?? "";
                console.debug(`${logPrefix} -> onBlur`, newContent);
                if (newContent !== node.content) {
                  TreeRoAPI.updateNode(node.node_id, { content: newContent });
                }
              }}
            >
              {node.content}
            </div>
            <Markdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={{
                code(props) {
                  const { children, className, node, ...rest } = props;
                  console.info("node", node);
                  console.info("className", className);
                  console.info("children", children);
                  console.info("rest", rest);

                  const match = /language-(\w+)/.exec(className || "");
                  return match ? (
                    <SyntaxHighlighter PreTag="div" language={match[1]}>
                      {String(children).replace(/\n$/, "")}
                    </SyntaxHighlighter>
                  ) : (
                    <code {...rest} className={className}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {node.content}
            </Markdown>
          </div>
          <button className="Node-options ml-1" type="button">
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

  const stateIsInitialized = useStore((state) => state.stateIsInitialized);
  const currentDocId = useStore((state) => state.currentDocId);

  const rootNode = useStore((state) => {
    if (!state.currentDocId) return null;
    const rootNodeId = state.getDocumentRootNodeId(state.currentDocId);
    if (!rootNodeId) return null;
    return state.nodes.get(rootNodeId);
  });

  console.debug(`${logPrefix} -> meta`, stateIsInitialized, currentDocId);
  console.debug(`${logPrefix} -> rootNode`, rootNode);

  if (!rootNode) return null;

  // const handleClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
  //   const target = e.target as HTMLElement;
  //   const bullet = target.closest<HTMLButtonElement>(".Node-bullet");
  // };

  const childNodes = TreeRoAPI.getNodeChildren(rootNode.node_id);

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
          </div>
        </div>
      </div>
    </>
  );
}

import { EllipsisVertical, Minus, PlusCircle } from "lucide-react";
import { memo, useEffect, useRef, useState } from "react";
import { useStore } from "./store";
import type { DocumentWithNodesDataType, OutlinerStructureDataType } from "./types";
// import { PlusCircle } from "@phosphor-icons/react";

import { TreeRoAPI } from "./api";

const documentSample: DocumentWithNodesDataType = {
  document_id: "c61d23a0-58ba-485e-a090-f418c578f95e", // crypto.randomUUID()
  root_node_id: "ce929a96-d6ce-4343-957d-6fbd49555273",
  nodes: [
    {
      node_id: "ce929a96-d6ce-4343-957d-6fbd49555273",
      content: "# Title",
      collapsed: false,
      created: Date.now(),
      modified: Date.now(),
      children: ["1f13b621-55ac-43f6-8b00-4749b4a192cf", "857fa9b9-989e-475d-8830-ebadd721304a"],
    },
    {
      node_id: "1f13b621-55ac-43f6-8b00-4749b4a192cf",
      content: "**Zebra**",
      collapsed: false,
      created: Date.now(),
      modified: Date.now(),
      children: ["2fc4bbbb-0a5c-4f80-8eed-b9e7d337570c"],
    },
    {
      node_id: "857fa9b9-989e-475d-8830-ebadd721304a",
      content: "```js\nx = 12;\n```",
      collapsed: false,
      created: Date.now(),
      modified: Date.now(),
      children: [],
    },
    {
      node_id: "2fc4bbbb-0a5c-4f80-8eed-b9e7d337570c",
      content: "Nested node",
      collapsed: false,
      created: Date.now(),
      modified: Date.now(),
      children: [],
    },
  ],
};

const outlinerStructureSample: OutlinerStructureDataType = {
  current_document_id: "c61d23a0-58ba-485e-a090-f418c578f95e",
  root_group_id: "6483444f-71cb-4027-a9a1-065264369987",
  groups: [
    {
      group_id: "6483444f-71cb-4027-a9a1-065264369987",
      name: "Untitled",
      collapsed: false,
      children: ["c61d23a0-58ba-485e-a090-f418c578f95e"],
    },
  ],
  documents: [documentSample],
};

function getPlainTextWithNewlines(element: HTMLElement): string {
  const BLOCK_TAGS = new Set(["DIV", "P", "LI", "SECTION", "ARTICLE", "HEADER", "FOOTER", "H1", "H2", "H3", "H4", "H5", "H6"]);
  let text = "";
  element.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      text += node.textContent;
    } else if (node.nodeType === Node.ELEMENT_NODE && BLOCK_TAGS.has(node.nodeName)) {
      text += getPlainTextWithNewlines(node as HTMLElement) + "\n";
    } else if (node.nodeType === Node.ELEMENT_NODE && node.nodeName === "BR") {
      text += "\n";
    }
  });
  return text;
}

function NodeComponent({ nodeId }: { nodeId: string }) {
  const logPrefix = `NodeComponent [${nodeId}]`;
  console.debug(logPrefix);
  // const ref = useRef<HTMLTextAreaElement>(null);
  // const [content, setContent] = useState(node.content);
  // const [collapsed, setCollapsed] = useState(node.collapsed);
  // const [html, setHtml] = useState(node.html || "");

  // useEffect(() => {
  //   if (visible && !node.html) {
  //     const rendered = marked(node.content);
  //     node.html = rendered; // cache in the data object
  //     setHtml(rendered);
  //   }
  // }, [visible, node]);

  // zustand subscribe
  const node = useStore((state) => {
    return state.nodes.get(nodeId);
  });

  if (!node) return;

  const childNodes = TreeRoAPI.getNodeChildren(node.node_id);

  return (
    <div className={`Node-outer`} data-id={node.node_id}>
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
            {/** biome-ignore lint/a11y/noStaticElementInteractions: <explanation> */}
            <div
              className="NodeContent-edit
                       select-text outline-none whitespace-pre-wrap break-words cursor-text"
              style={{
                textDecorationSkipInk: "none",
                textRendering: "optimizeLegibility",
              }}
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
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.ctrlKey) {
                  console.debug(`${logPrefix} -> onKeyDown`, e);
                  e.preventDefault();
                  // const newNode = TreeRoAPI.createNode()
                  // TreeRoAPI.addNode()
                  // // Call your API to create a new sibling node
                  // TreeRoAPI.createSiblingNode(node.node_id);
                }
              }}
              onBlur={(e) => {
                console.debug(`${logPrefix} -> onBlur`, e);
                const newContent = getPlainTextWithNewlines(e.currentTarget);
                // const newContent = e.currentTarget.textContent ?? "";
                console.debug(`${logPrefix} -> onBlur`, newContent);
                if (newContent !== node.content) {
                  TreeRoAPI.updateNode(node.node_id, { content: newContent });
                }
              }}
            >
              {node.content}
            </div>
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
  useEffect(() => {
    TreeRoAPI.updateStateFromStructure(outlinerStructureSample);
    TreeRoAPI.updateStateFromDoc(documentSample);
  }, []);

  const currentDocId = useStore((state) => state.currentDocId);
  console.debug("DocumentComponent", currentDocId);

  const rootNode = useStore((state) => {
    if (!state.currentDocId) return null;
    const rootNodeId = state.getDocumentRootNodeId(state.currentDocId);
    if (!rootNodeId) return null;
    return state.nodes.get(rootNodeId);
  });

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
          <div className="RootNode flex items-start">
            <h1 className="RootNodeContent">{rootNode.content}</h1>
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

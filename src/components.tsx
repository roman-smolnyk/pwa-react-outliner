import { useState, useEffect } from "react";
import { PlusIcon, MinusIcon } from "@heroicons/react/24/solid";
import { create } from "zustand";

interface NodeData {
  id: string;
  content: string;
  collapsed: boolean;
  created: number;
  modified: number;
  children: string[];
  html?: string; // Temp
}

interface DocumentData {
  document_id: string;
  root_id: string;
  nodes: NodeData[];
}

const sampleDocument = (): DocumentData => ({
  document_id: "c61d23a0-58ba-485e-a090-f418c578f95e", // crypto.randomUUID()
  root_id: "root",
  nodes: [
    {
      id: "root",
      content: "# Title",
      collapsed: false,
      created: Date.now(),
      modified: Date.now(),
      children: ["1f13b621-55ac-43f6-8b00-4749b4a192cf", "857fa9b9-989e-475d-8830-ebadd721304a"],
    },
    {
      id: "1f13b621-55ac-43f6-8b00-4749b4a192cf",
      content: "**Zebra**",
      collapsed: false,
      created: Date.now(),
      modified: Date.now(),
      children: ["2fc4bbbb-0a5c-4f80-8eed-b9e7d337570c"],
    },
    {
      id: "857fa9b9-989e-475d-8830-ebadd721304a",
      content: "```js\nx = 12;\n```",
      collapsed: false,
      created: Date.now(),
      modified: Date.now(),
      children: [],
    },
    {
      id: "2fc4bbbb-0a5c-4f80-8eed-b9e7d337570c",
      content: "Nested node",
      collapsed: false,
      created: Date.now(),
      modified: Date.now(),
      children: [],
    },
  ],
});

function Node_({ node, nodes, visible }: { node: NodeData; nodes: NodeData[]; visible: boolean }) {
  const [content, setContent] = useState(node.content);
  // const [html, setHtml] = useState(node.html || "");

  // useEffect(() => {
  //   if (visible && !node.html) {
  //     const rendered = marked(node.content);
  //     node.html = rendered; // cache in the data object
  //     setHtml(rendered);
  //   }
  // }, [visible, node]);

  const childNodes = nodes.filter((n) => node.children.includes(n.id));

  return (
    <div className={["Node-outer", !visible ? "hidden" : "block"].join(" ")}>
      <div className="Node-inner">
        <div className="Node-self flex items-start">
          <button className="Node-bullet mr-2" type="button" data-node-id={node.id} onClick={() => {console.log("what?")}}>
            {node.children.length > 0 ? node.collapsed ? <PlusIcon className="size-4 text-500" /> : <MinusIcon className="size-4 text-500" /> : <span>●</span>}
          </button>
          <div className="NodeContent-container flex-grow">
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
              spellCheck={false}
              autoCorrect="off"
              onInput={(e) => setContent((e.target as HTMLDivElement).innerText)}
            >
              {content}
            </div>
          </div>
          <button className="Node-options ml-1" type="button">
            <span>⋮</span>
          </button>
        </div>
        <div className="NodeChildren border-l ml-1 pl-3">
          {childNodes.map((child) => (
            <Node_ key={child.id} node={child} nodes={nodes} visible={!node.collapsed} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Document_() {
  const [doc, setDoc] = useState<DocumentData>(sampleDocument());

  const toggleCollapse = (id: string) => {
    setDoc((prev) => ({
      ...prev,
      nodes: prev.nodes.map((n) => (n.id === id ? { ...n, collapsed: !n.collapsed } : n)),
    }));
  };

  const handleClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    // Look for the bullet button that was clicked
    const target = e.target as HTMLElement;
    const bullet = target.closest<HTMLButtonElement>(".Node-bullet");
    console.log("BULLET", bullet);
    if (!bullet) return;

    // The node id is stored in a data attribute
    const nodeId = bullet.dataset.nodeId;
    if (nodeId) toggleCollapse(nodeId);
  };

  const newRootNode: NodeData = { id: crypto.randomUUID(), content: "", collapsed: false, created: Date.now(), modified: Date.now(), children: [] };

  const rootNode: NodeData = doc.nodes.find((n) => n.id === doc.root_id) || newRootNode;
  const childNodes = doc.nodes.filter((n) => rootNode.children.includes(n.id));

  return (
    <>
      {/* <h1 className="TestTestTest hidden text-3xl font-bold underline m-8">
        Hello world!
      </h1> */}
      <div className="Document mx-2 sm:mx-8 md:mx-16 lg:mx-32 xl:mx-64">
        <div className="RootNode-self">
          <div className="RootNode flex items-start">
            <h1 className="RootNodeContent">{rootNode.content}</h1>
          </div>
          {/** biome-ignore lint/a11y/useKeyWithClickEvents: explanation */}
          {/** biome-ignore lint/a11y/noStaticElementInteractions: explanation */}
          <div className="RootNodeChildren" onClick={handleClick}>
            {childNodes.map((child) => (
              <Node_ key={child.id} node={child} nodes={doc.nodes} visible={true} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

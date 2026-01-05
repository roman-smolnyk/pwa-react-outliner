//
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useStore } from "../stateStore";
import { TreeRoAPI } from "../api";
import { scrollIntoView } from "../etc/utilities";
import type { NodeDataType } from "../types";

import { XIcon } from "lucide-react";

const rootEl = document.getElementById("root")!;

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

function ItemComponent({ nodeId, nodeContent, query }: { nodeId: string; nodeContent: string; query: string }) {
  const documentId = TreeRoAPI.getNodeDocumentId(nodeId);
  const document_ = TreeRoAPI.useStore.getState().documents.get(documentId as string);
  if (!documentId || !document_) return;
  const documentPath = TreeRoAPI.traverseDocumentPath(documentId);
  const nodePathMap = TreeRoAPI.traverseNodePath(nodeId);

  const nodePathValues = Array.from(nodePathMap.values());

  const path = [...documentPath, ...nodePathValues].map((s) => (s.length > 10 ? s.slice(0, 10) + "…" : s));

  const regex = new RegExp(`(${query})`, "gi");
  const parts = nodeContent.split(regex);

  return (
    <div
      className="cursor-pointer border-b border-gray-100 px-1 py-1 text-sm hover:bg-gray-100"
      onClick={() => {
        TreeRoAPI.uiOpenNode(nodeId, documentId);
        useStore.setState({ globalSearchIsOpened: false });
        setTimeout(() => {
          //   document.getElementById(nodeId)?.scrollIntoView({ behavior: "smooth" });
          // scrollIntoView(document.getElementById(nodeId) as HTMLElement, document.querySelector(".Document-scroll") as HTMLElement);
        }, 1_000);
      }}
    >
      {parts.map((part, _idx) => (regex.test(part) ? <span className="bg-yellow-200 text-black">{part}</span> : <span>{part}</span>))}
      <div className="text-gray-400">{`${path.join("/")}`}</div>
    </div>
  );
}

export function GlobalSearchPortalComponent() {
  const refInput = useRef<HTMLInputElement | null>(null);
  const [query, setQuery] = useState("");

  const globalSearchIsOpened = useStore((state) => state.globalSearchIsOpened);

  const nodes = useStore((state) => state.nodes);

  let filteredNodes: NodeDataType[] = [];
  if (query) {
    filteredNodes = [...nodes.values()].filter((a) => a.content.toLowerCase().includes(query.toLowerCase()));
  }

  useEffect(() => {
    refInput.current?.focus();
  }, []);

  return createPortal(
    <div
      className="fixed inset-0 z-9999 bg-black/30"
      onClick={() => {
        useStore.setState({ globalSearchIsOpened: !globalSearchIsOpened });
      }}
    >
      <div
        className="absolute top-1/4 left-1/2 -translate-y-1/4 -translate-x-1/2
                   w-2/3 min-w-90 max-w-250 
                   h-3/4 
                   p-3 
                   rounded-lg bg-white shadow-2xl
                   flex flex-col"
        onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside modal
      >
        <div className="flex items-center gap-2">
          <input
            ref={refInput}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
            className="flex-1 rounded text-sm  px-2 py-1
                       border border-gray-300 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          />
          <ButtonComponent
            onClick={() => {
              useStore.setState({ globalSearchIsOpened: !globalSearchIsOpened });
            }}
          >
            <XIcon />
          </ButtonComponent>
        </div>

        <div className="mt-2 flex-1 overflow-y-auto overflow-x-hidden wrap-break-word">
          {filteredNodes.map((node) => (
            <ItemComponent key={`${node.node_id}-search`} nodeId={node.node_id} nodeContent={node.content} query={query} />
          ))}

          {filteredNodes.length === 0 && <div className="px-1 py-2 text-sm text-gray-500">No results</div>}
        </div>
      </div>
    </div>,
    rootEl,
  );
}

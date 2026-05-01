import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { getBlock } from "esm-treero-api";
import { INDENT } from "../../config/appConfig.tsx";
import yjs from "../../store/yjsManager.tsx";
import BlockContent from "./BlockContent.tsx";

import { EllipsisVerticalIcon, MinusIcon, PlusCircleIcon, DotIcon, CircleIcon } from "lucide-react";
import { BlockOptions } from "./BlockOptions.tsx";

function HandleButton({
  id,
  collapsed,
  children_,
  attributes,
  listeners,
}: {
  id: string;
  collapsed: boolean;
  children_: string[];
  attributes: any;
  listeners: any;
}) {
  return (
    <button
      className="TreeItem-handle flex flex-none items-center justify-center cursor-pointer min-h-5 min-w-5"
      type="button"
      {...attributes}
      {...listeners}
      onPointerUpCapture={() => {
        console.debug("TreeItem-handle onPointerUpCapture");
        if (children_.length !== 0) {
          const yblock = getBlock(yjs.ydoc, id);
          yblock.set("collapsed", !collapsed);
        }

        // TreeRoAPI.collapseBlock(block.id);
      }}
    >
      {children_.length > 0 ? (
        collapsed ? (
          <PlusCircleIcon size={12} strokeWidth={2.5} />
        ) : (
          <MinusIcon size={12} strokeWidth={2.5} />
        )
      ) : (
        <CircleIcon size={7} fill="black" />
      )}
    </button>
  );
}

export default function Block({
  id,
  collapsed,
  children_,
  depth,
  index,
  isRoot,
}: {
  id: string;
  collapsed: boolean;
  children_: string[];
  depth: number;
  index: number;
  isRoot: boolean;
}) {
  const { attributes, listeners, setDraggableNodeRef, setDroppableNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  if (isRoot) {
    depth = 1;
  }

  return (
    <div className={`TreeItem-wrapper ${isRoot ? "mb-5" : ""}`} ref={setDroppableNodeRef} style={{ paddingLeft: `${INDENT * (depth - 1)}px` }}>
      <div className={`TreeItem flex items-start`} ref={setDraggableNodeRef} style={style}>
        {!isRoot && <HandleButton id={id} collapsed={collapsed} children_={children_} attributes={attributes} listeners={listeners} />}
        <div className="flex-auto flex">
          <BlockContent id={id} />
        </div>

        <BlockOptions id={id} isRoot={isRoot} />

        {/* // ! ID */}
        <div className="NodeDebugId text-xs min-w-10">{id.slice(0, 5)}</div>
      </div>
    </div>
  );
}

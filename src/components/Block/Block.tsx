import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { getBlock } from "esm-treero-api";
import { INDENT } from "../../config/appConfig.tsx";
import yjs from "../../store/yjsManager.tsx";
import BlockContent from "./BlockContent.tsx";

import { EllipsisVerticalIcon, MinusIcon, PlusCircleIcon, DotIcon, CircleIcon, CircleMinusIcon } from "lucide-react";
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
      className="HandleButton flex flex-none items-center justify-center cursor-pointer min-h-5 min-w-5"
      type="button"
      {...attributes}
      {...listeners}
      onPointerUpCapture={() => {
        console.debug("onPointerUpCapture");
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
          // <MinusIcon size={12} strokeWidth={2.5} />
          <CircleMinusIcon size={12} strokeWidth={2.5} />
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
  isRoot,
  isActive,
  isOver,
  projectedDepth,
}: {
  id: string;
  collapsed: boolean;
  children_: string[];
  depth: number;
  isRoot: boolean;
  isActive: boolean;
  isOver: boolean;
  projectedDepth?: number;
}) {
  const { attributes, listeners, setDraggableNodeRef, setDroppableNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  if (isRoot) {
    depth = 1;
  }

  if (isActive) {
    depth = projectedDepth || depth;

    return (
      <div className={`Block ${isRoot ? "mb-5" : ""}`} ref={setDroppableNodeRef} style={{ paddingLeft: `${INDENT * (depth - 1)}px` }}>
        <div className="flex" ref={setDraggableNodeRef} style={style}>
          <DropIndicator />
        </div>
      </div>
    );
  }

  return (
    <div className={`Block ${isRoot ? "mb-5" : ""}`} ref={setDroppableNodeRef} style={{ paddingLeft: `${INDENT * (depth - 1)}px` }}>
      <div className={`flex items-start ${isActive ? "bg-amber-400" : ""}`} ref={setDraggableNodeRef} style={style}>
        {!isRoot && <HandleButton id={id} collapsed={collapsed} children_={children_} attributes={attributes} listeners={listeners} />}

        {/* // ! ID */}
        {/* <div className="text-xs min-w-10">{id.slice(0, 5)}</div> */}

        <div className="flex-auto flex min-w-0">
          <BlockContent id={id} />
        </div>
        <BlockOptions id={id} isRoot={isRoot} />
      </div>
      {/* {isOver && <DropIndicator shrink={!!(projectedDepth && projectedDepth > depth)} />} */}
      {/* {isOver && <div className={`${projectedDepth && projectedDepth > depth ? "pl-5" : ""}`}>==========</div>} */}
    </div>
  );
}

function DropIndicator() {
  return (
    <div className="relative flex items-center w-full pl-2.5 pr-3">
      <div className="absolute left-1.5 w-3 h-3 rounded-full bg-blue-500"></div>
      <div className=" w-full h-1.5 rounded-full bg-blue-500"></div>
    </div>
  );
}

// function DropIndicator({ shrink = false }) {
//   if (shrink) {
//     return (
//       <div className="relative before:absolute before:content-[''] before:top-0 before:end-0 before:h-1 before:w-3/4 before:bg-blue-400 before:-translate-y-1/2" />
//     );
//   } else {
//     return (
//       <div className="relative before:absolute before:content-[''] before:top-0 before:start-0 before:end-0 before:h-1 before:bg-blue-400 before:-translate-y-1/2" />
//     );
//   }
// }

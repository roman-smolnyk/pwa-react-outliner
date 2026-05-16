import { useSortable } from "@dnd-kit/sortable";
import { CSS as DnDCSS } from "@dnd-kit/utilities";
import { getItem } from "esm-treero-api";
import { CircleIcon, CircleMinusIcon, PlusCircleIcon } from "lucide-react";
import { INDENT } from "../../../config.tsx";
import useZustandStore from "../../store/useZustandStore.tsx";
import yjs from "../../store/yjsManager.tsx";
import BlockContent from "./BlockContent.tsx";
import { BlockOptions } from "./BlockOptions.tsx";
import { memo } from "react";

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
      className="HandleButton mt-1 flex flex-none items-center justify-center cursor-pointer min-h-5 min-w-5"
      type="button"
      {...attributes}
      {...listeners}
      onPointerUpCapture={() => {
        console.debug("onPointerUpCapture");
        if (children_.length !== 0) {
          const yblock = getItem(yjs.yblocks, id);
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

// const Block = memo(
//   ({
export default function Block({
  id,
  collapsed,
  children_,
  depth,
  isRoot,
  isActive,
}: {
  id: string;
  collapsed: boolean;
  children_: string[];
  depth: number;
  isRoot: boolean;
  isActive: boolean;
}) {
  // console.debug("Block");
  const isChekboxSelectionActive = useZustandStore((s) => s.isChekboxSelectionActive);
  const { attributes, listeners, setDraggableNodeRef, setDroppableNodeRef, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: DnDCSS.Translate.toString(transform),
    transition,
  };

  if (isRoot) {
    depth = 1;
  }

  return (
    <div
      className={`Block ${isRoot ? "mb-5" : ""}`}
      ref={setNodeRef}
      style={{ ...style, paddingLeft: `${INDENT * (depth - 1)}px` }}
      data-block-id={id}
    >
      <div className={`flex items-start`}>
        {isActive ? (
          <DropIndicator />
        ) : (
          <>
            {!isRoot && isChekboxSelectionActive && (
              <div className="min-h-5 min-w-5 cursor-pointer flex items-center justify-center">
                <input type="checkbox" className="form-checkbox h-4 w-4 text-blue-600" />
              </div>
            )}
            {!isRoot && <HandleButton id={id} collapsed={collapsed} children_={children_} attributes={attributes} listeners={listeners} />}

            {/* // ! ID */}
            {/* <div className="text-xs min-w-10">{id.slice(0, 5)}</div> */}

            <div className="flex-auto flex min-w-0">
              <BlockContent id={id} />
            </div>

            <BlockOptions id={id} isRoot={isRoot} />
          </>
        )}
      </div>
    </div>
  );
}
// export default Block;

function DropIndicator() {
  return (
    <div className="relative flex items-center w-full pl-2.5 pr-3">
      <div className="absolute left-1.5 w-3 h-3 rounded-full bg-blue-500"></div>
      <div className=" w-full h-1.5 rounded-full bg-blue-500"></div>
    </div>
  );
}

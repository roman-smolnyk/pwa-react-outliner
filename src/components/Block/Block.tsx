import { useSortable } from "@dnd-kit/sortable";
import { CSS as DnDCSS } from "@dnd-kit/utilities";
import { getItem } from "esm-treero-api";
import { CircleIcon, CircleMinusIcon, PlusCircleIcon } from "lucide-react";
import { INDENT } from "../../../config.tsx";
import useZustandStore from "../../store/useZustandStore.tsx";
import yjs from "../../store/yjsManager.tsx";
import Button from "../Common/Button.tsx";
import LucideIcon from "../Common/LucideIcon.tsx";
import BlockContent from "./BlockContent.tsx";
import { BlockOptions } from "./BlockOptions.tsx";

function HandleButton({
  id,
  collapsed,
  children_,
  attributes,
  listeners,
  ...props
}: {
  id: string;
  collapsed: boolean;
  children_: string[];
  attributes: any;
  listeners: any;
}) {
  return (
    <Button
      title={id}
      className="HandleButton size-5! mt-1 active:*:scale-100!"
      {...attributes}
      {...listeners}
      onPointerUpCapture={() => {
        console.debug("onPointerUpCapture");
        if (children_.length !== 0) {
          const yblock = getItem(yjs.yblocks, id);
          yblock.set("collapsed", !collapsed);
        }
      }}
    >
      {children_.length > 0 ? (
        collapsed ? (
          <LucideIcon className="size-auto! [&>svg]:w-auto! [&>svg]:h-auto!" icon={<PlusCircleIcon size={12} strokeWidth={2.5} />} />
        ) : (
          <LucideIcon className="size-auto! [&>svg]:w-auto! [&>svg]:h-auto!" icon={<CircleMinusIcon size={12} strokeWidth={2.5} />} />
        )
      ) : (
        <LucideIcon
          className="size-auto! [&>svg]:w-auto! [&>svg]:h-auto!"
          icon={<CircleIcon className="fill-primary" size={7} fill="none" />}
        />
      )}
    </Button>
  );
}

function IndentGuides({ id, depth }: { id: string; depth: number }) {
  if (depth <= 1) return null;

  return (
    <div className="absolute inset-y-0 left-0 pointer-events-none">
      {Array.from({ length: depth - 1 }).map((_, i) => (
        <div
          key={`indent-guide-${id}-${i}`}
          className="absolute top-0 bottom-0 w-px bg-border"
          style={{
            left: `${INDENT * i + INDENT / 2}px`,
          }}
        />
      ))}
    </div>
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
      className={`Block relative ${isRoot ? "mb-5" : ""}`}
      ref={setNodeRef}
      style={{ ...style, paddingLeft: `${INDENT * (depth - 1)}px` }}
      data-block-id={id}
    >
      <IndentGuides id={id} depth={depth} />
      <div className={`flex items-start`}>
        {isActive ? (
          <DropIndicator />
        ) : (
          <>
            {!isRoot && isChekboxSelectionActive && (
              <div className="min-h-5 min-w-5 cursor-pointer flex items-center justify-center">
                <input type="checkbox" className="form-checkbox h-4 w-4 text-info" />
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
      <div className="absolute left-1.5 w-3 h-3 rounded-full bg-info"></div>
      <div className=" w-full h-1.5 rounded-full bg-info"></div>
    </div>
  );
}

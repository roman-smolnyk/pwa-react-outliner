import { useSortable } from "@dnd-kit/sortable";
import { FileTextIcon, FolderDownIcon, FolderIcon, FolderInputIcon } from "lucide-react";
import useZustandStore from "../../store/useZustandStore";

import { getCollection } from "esm-treero-api";
import { INDENT } from "../../../config.tsx";
import yjs from "../../store/yjsManager.tsx";

import { CSS as DnDCSS } from "@dnd-kit/utilities";

function HandleButton({
  id,
  type,
  collapsed,
  children_,
  attributes,
  listeners,
}: {
  id: string;
  type: number;
  collapsed?: boolean;
  children_?: string[];
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
        if (children_ && children_.length !== 0) {
          const ycollection = getCollection(yjs.ydoc, id);
          ycollection.set("collapsed", !collapsed);
        }
      }}
    >
      {type === 1 ? (
        <FileTextIcon size={17} strokeWidth={2.5} />
      ) : children_ && children_.length > 0 ? (
        collapsed ? (
          <FolderInputIcon size={17} strokeWidth={2.5} />
        ) : (
          <FolderDownIcon size={17} strokeWidth={2.5} />
        )
      ) : (
        <FolderIcon size={17} strokeWidth={2.5} />
      )}
    </button>
  );
}

export default function ExplorerItem({
  id,
  type,
  title,
  collapsed,
  children_,
  depth,
  isRoot,
  isActive,
}: {
  id: string;
  type: number;
  title: string;
  collapsed?: boolean;
  children_?: string[];
  depth: number;
  isRoot: boolean;
  isActive: boolean;
}) {
  const isChekboxSelectionActive = useZustandStore((state) => state.isChekboxSelectionActive);
  const { attributes, listeners, setDraggableNodeRef, setDroppableNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: DnDCSS.Translate.toString(transform),
    transition,
  };

  if (isRoot) {
    depth = 1;
  }

  if (type === 1) {
  }

  return (
    <div className={`ExplorerItem ${isRoot ? "mb-5" : ""}`} ref={setDroppableNodeRef} style={{ paddingLeft: `${INDENT * (depth - 1)}px` }}>
      <div className={`flex items-start`} ref={setDraggableNodeRef} style={style}>
        {isActive ? (
          <DropIndicator />
        ) : (
          <>
            {!isRoot && isChekboxSelectionActive && (
              <div className="min-h-5 min-w-5 cursor-pointer flex items-center justify-center">
                <input type="checkbox" className="form-checkbox h-4 w-4 text-blue-600" />
              </div>
            )}
            {!isRoot && (
              <HandleButton id={id} type={type} collapsed={collapsed} children_={children_} attributes={attributes} listeners={listeners} />
            )}

            {/* // ! ID */}
            {/* <div className="text-xs min-w-10">{id.slice(0, 5)}</div> */}

            <div className="flex-auto flex min-w-0">
              {/* <BlockContent id={id} /> */}
              {title}
            </div>

            {/* <BlockOptions id={id} isRoot={isRoot} /> */}
          </>
        )}
      </div>
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

import { useSortable } from "@dnd-kit/sortable";
import { FileTextIcon, FolderDownIcon, FolderIcon, FolderInputIcon } from "lucide-react";
import useZustandStore from "../../store/useZustandStore.tsx";

import { getItem, COLLECTION_TYPE, PAGE_TYPE } from "esm-treero-api";
import { INDENT } from "../../../config.tsx";
import yjs from "../../store/yjsManager.tsx";

import { CSS as DnDCSS } from "@dnd-kit/utilities";
import { useMemo, useState } from "react";
import TitleEdit from "./TitleEdit.tsx";
import Title from "./Title.tsx";
import ExpEntryOptions from "./ExpEntryOptions.tsx";
import { openBlock } from "../../api/api.tsx";

function HandleButton({
  id,
  type,
  collapsed,
  children_,
  attributes,
  listeners,
  onClick,
}: {
  id: string;
  type: number;
  collapsed?: boolean;
  children_?: string[];
  attributes: any;
  listeners: any;
  onClick: (event: React.PointerEvent<HTMLButtonElement>) => void;
}) {
  return (
    <button
      className="HandleButton flex flex-none items-center justify-center cursor-pointer min-h-5 min-w-5"
      type="button"
      {...attributes}
      {...listeners}
      onPointerUpCapture={onClick}
    >
      {type === PAGE_TYPE ? (
        <FileTextIcon size={24} />
      ) : children_ && children_.length > 0 ? (
        collapsed ? (
          <FolderInputIcon size={24} />
        ) : (
          <FolderDownIcon size={24} />
        )
      ) : (
        <FolderIcon size={24} />
      )}
    </button>
  );
}

export default function ExpEntry({
  id,
  type,
  title,
  collapsed,
  children_,
  depth,
  isActive,
  isSelected,
}: {
  id: string;
  type: number;
  title: string;
  collapsed?: boolean;
  children_?: string[];
  depth: number;
  isActive: boolean;
  isSelected: boolean;
}) {
  const [isEdit, setIsEdit] = useState(false);
  const { attributes, listeners, setDraggableNodeRef, setDroppableNodeRef, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: DnDCSS.Translate.toString(transform),
    transition,
  };

  // Visual Fix
  if (depth === 0) {
    depth = 1;
  }

  const yitem = useMemo(() => getItem(yjs.yexplorer, id), [id]);

  function onClick() {
    if (type === PAGE_TYPE) {
      openBlock(yitem.get("root_id") as string);
    } else if (type === COLLECTION_TYPE && children_ && children_.length !== 0) {
      yitem.set("collapsed", !collapsed);
    }
  }

  return (
    <div
      className={`ExpEntry min-w-0 rounded-sm hover:bg-gray-200 ${isSelected && !isActive ? "bg-gray-300" : ""} `}
      ref={setNodeRef}
      style={{ ...style, paddingLeft: `${INDENT * (depth - 1)}px` }}
    >
      <div className={`min-w-0 flex items-center justify-center`}>
        {isActive ? (
          <DropIndicator />
        ) : (
          <>
            <HandleButton
              id={id}
              type={type}
              collapsed={collapsed}
              children_={children_}
              attributes={attributes}
              listeners={listeners}
              onClick={onClick}
            />

            {/* // ! ID */}
            {/* <div className="text-xs min-w-10">{id.slice(0, 5)}</div> */}

            <div className="flex-1 min-w-0 flex">
              {isEdit ? (
                <TitleEdit id={id} title={title} setIsEdit={setIsEdit} />
              ) : (
                <div className="w-full min-w-0 flex" onClick={onClick}>
                  <Title title={title} />
                </div>
              )}
            </div>

            <ExpEntryOptions id={id} setIsEdit={setIsEdit} />
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

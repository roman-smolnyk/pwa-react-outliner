import { useSortable } from "@dnd-kit/sortable";
import { CSS as DnDCSS } from "@dnd-kit/utilities";
import { COLLECTION_TYPE, getItem, PAGE_TYPE } from "esm-treero-api";
import { FileTextIcon, FolderDownIcon, FolderIcon, FolderInputIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { INDENT } from "../../../config.tsx";
import { handleBlockOpen } from "../../api/api.tsx";
import yjs from "../../store/yjsManager.tsx";
import ExpEntryOptions from "./ExpEntryOptions.tsx";
import Title from "./Title.tsx";
import TitleEdit from "./TitleEdit.tsx";
import LucideIcon from "../Common/LucideIcon.tsx";

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
      className={`HandleButton flex-none flex items-center justify-center ${type === COLLECTION_TYPE ? "cursor-pointer" : ""}`}
      type="button"
      {...attributes}
      {...listeners}
      onPointerUpCapture={onClick}
    >
      <LucideIcon>
        {type === PAGE_TYPE ? (
          <FileTextIcon />
        ) : children_ && children_.length > 0 ? (
          collapsed ? (
            <FolderInputIcon />
          ) : (
            <FolderDownIcon />
          )
        ) : (
          <FolderIcon />
        )}
      </LucideIcon>
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

  async function onClick() {
    if (type === PAGE_TYPE) {
      await handleBlockOpen(yitem.get("root_id") as string);
    } else if (type === COLLECTION_TYPE && children_ && children_.length !== 0) {
      yitem.set("collapsed", !collapsed);
    }
  }

  return (
    <div
      className={`ExpEntry min-w-0 py-1 pr-3 ${
        isSelected && !isActive
          ? "bg-theme-bg-selected border-l-16 sm:border-l-12 border-theme-bg-selected"
          : "border-l-16 sm:border-l-12 border-transparent hover:bg-theme-bg-hover hover:border-theme-bg-hover"
      }`}
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

            <div className="flex-1 min-w-0 max-sm:text-lg flex">
              {isEdit ? (
                <TitleEdit id={id} title={title} setIsEdit={setIsEdit} />
              ) : (
                <div className="w-full min-w-0 flex" onClick={onClick}>
                  <Title title={title} />
                </div>
              )}
            </div>

            <ExpEntryOptions id={id} type={type} setIsEdit={setIsEdit} />
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

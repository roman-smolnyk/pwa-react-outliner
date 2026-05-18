import { useSortable } from "@dnd-kit/sortable";
import { CSS as DnDCSS } from "@dnd-kit/utilities";
import { COLLECTION_TYPE, getItem, PAGE_TYPE } from "esm-treero-api";
import { ChevronRightIcon, CircleIcon, FileTextIcon, FolderDownIcon, FolderIcon, FolderInputIcon, GripVerticalIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { INDENT } from "../../../config.tsx";
import { handleBlockOpen } from "../../api/api.tsx";
import yjs from "../../store/yjsManager.tsx";
import Button from "../Common/Button.tsx";
import LucideIcon from "../Common/LucideIcon.tsx";
import ExpEntryOptions from "./ExpEntryOptions.tsx";
import Title from "./Title.tsx";
import TitleEdit from "./TitleEdit.tsx";

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
  onClick: (event: React.PointerEvent<HTMLButtonElement> | React.MouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <Button
      className="HandleButton [&_svg]:size-5! active:*:scale-100!"
      {...attributes}
      {...listeners}
      onClick={(e) => type === COLLECTION_TYPE && onClick(e)}
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
    </Button>
  );

  // return (
  //   <Button className="size-5! active:*:scale-100!" {...attributes} {...listeners} onClick={(e) => type === COLLECTION_TYPE && onClick(e)}>
  //     <LucideIcon className="size-auto!">
  //       {type === PAGE_TYPE ? (
  //         <GripVerticalIcon />
  //       ) : (
  //         <ChevronRightIcon className={`transition-transform duration-200 ease-in-out ${!collapsed ? "rotate-90" : ""}`} />
  //       )}
  //     </LucideIcon>
  //   </Button>
  // );
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

  async function onClick(e: React.PointerEvent<HTMLButtonElement> | React.MouseEvent<HTMLButtonElement | HTMLDivElement>) {
    console.debug("onClick", type);
    e.preventDefault();
    if (type === PAGE_TYPE) {
      await handleBlockOpen(yitem.get("root_id") as string);
    } else if (type === COLLECTION_TYPE) {
      console.debug("COOLLLAA", !collapsed);
      yitem.set("collapsed", !collapsed);
    }
  }

  return (
    <div
      className={`ExpEntry relative min-w-0 pr-3 ${
        isSelected && !isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground border-l-16 sm:border-l-12 border-sidebar-accent"
          : "border-l-16 sm:border-l-12 border-transparent hover:bg-sidebar-accent hover:border-sidebar-accent hover:text-sidebar-accent-foreground"
      }`}
      ref={setNodeRef}
      style={{ ...style, paddingLeft: `${INDENT * (depth - 1)}px` }}
    >
      <IndentGuides id={id} depth={depth} />
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

            <div className="flex-1 min-w-0 flex">
              {isEdit ? (
                <TitleEdit id={id} title={title} setIsEdit={setIsEdit} />
              ) : (
                <div className="w-full min-w-0 flex cursor-pointer" onClick={onClick}>
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
    <div className="relative flex items-center w-full pl-2.5 pr-3 z-20">
      <div className="absolute left-1.5 w-3 h-3 rounded-full bg-info"></div>
      <div className=" w-full h-1.5 rounded-full bg-info"></div>
    </div>
  );
}

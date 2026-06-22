import { Button } from "@/components/ui/button";
import { useSortable } from "@dnd-kit/sortable";
import { CSS as DnDCSS } from "@dnd-kit/utilities";
import { COLLECTION_TYPE, getItem, PAGE_TYPE } from "esm-treero-api";
import log from "loglevel";
import { FileTextIcon, FolderDownIcon, FolderIcon, FolderInputIcon } from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { INDENT } from "../../../config.tsx";
import { handleBlockOpen } from "../../api/api.tsx";
import yjs from "../../store/yjsManager.tsx";
import DropIndicator from "../Common/DropIndicator.tsx";
import IndentGuide from "../Common/IndentGuide.tsx";
import ExpEntryOptions from "./ExpEntryOptions.tsx";
import { Title, TitleRename } from "./Title.tsx";

function HandleButton({
  id,
  type,
  collapsed,
  childrenLength,
  attributes,
  listeners,
  onClick,
}: {
  id: string;
  type: number;
  collapsed?: boolean;
  childrenLength?: number;
  attributes: any;
  listeners: any;
  onClick: (event: React.PointerEvent<HTMLButtonElement> | React.MouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <Button
      className="HandleButton"
      variant="ghost"
      size="icon-sm"
      {...attributes}
      {...listeners}
      onClick={(e) => type === COLLECTION_TYPE && onClick(e)}
    >
      {type === PAGE_TYPE ? (
        <FileTextIcon />
      ) : childrenLength !== undefined && childrenLength > 0 ? (
        collapsed ? (
          <FolderInputIcon />
        ) : (
          <FolderDownIcon />
        )
      ) : (
        <FolderIcon />
      )}
    </Button>
  );
}

// ! Custom memo condition
const ExpEntryInner = memo(
  function ExpEntryInner({
    id,
    type,
    title,
    collapsed,
    childrenLength,
    depth,
    isActive,
    isSelected,
    isBookmarked,
    setRefs,
    handleProps,
  }: {
    id: string;
    type: number;
    title: string;
    collapsed?: boolean;
    childrenLength?: number;
    depth: number;
    isActive: boolean;
    isSelected: boolean;
    isBookmarked: boolean;
    setRefs: any;
    handleProps: any;
  }) {
    // log.debug("ExpEntryInner", id);
    const [isRename, setIsRename] = useState(false);

    if (depth === 0) depth = 1;

    const yitem = useMemo(() => getItem(yjs.yexplorer, id), [id]);

    async function onClick(e: React.PointerEvent<HTMLButtonElement> | React.MouseEvent<HTMLButtonElement | HTMLDivElement>) {
      log.debug("onClick", type);
      e.preventDefault();
      if (type === PAGE_TYPE) {
        await handleBlockOpen(yitem.get("root_id") as string);
      } else if (type === COLLECTION_TYPE) {
        log.debug("COOLLLAA", !collapsed);
        yitem.set("collapsed", !collapsed);
      }
    }

    return (
      <div
        className={`ExpEntryInner relative min-w-0 pr-3 ${
          isSelected && !isActive
            ? "bg-sidebar-accent text-sidebar-accent-foreground border-l-16 border-sidebar-accent"
            : "border-l-16 border-transparent hover:bg-sidebar-accent hover:border-sidebar-accent hover:text-sidebar-accent-foreground"
        }`}
        ref={setRefs}
        style={{ paddingLeft: `${INDENT * (depth - 1)}px` }}
      >
        <IndentGuide id={id} depth={depth} />
        <div className={`min-w-0 flex items-center justify-center`}>
          {isActive ? (
            <DropIndicator />
          ) : (
            <>
              <HandleButton id={id} type={type} collapsed={collapsed} childrenLength={childrenLength} onClick={onClick} {...handleProps} />

              <div className="flex-1 min-w-0 flex">
                {isRename ? (
                  <TitleRename id={id} title={title} setIsRename={setIsRename} />
                ) : (
                  <div className="w-full min-w-0 flex cursor-pointer" onClick={onClick}>
                    <Title title={title} />
                  </div>
                )}
              </div>

              <ExpEntryOptions id={id} type={type} isBookmarked={isBookmarked} setIsRename={setIsRename} />
            </>
          )}
        </div>
      </div>
    );
  },
  (prev, next) => {
    return (
      prev.id === next.id &&
      prev.type === next.type &&
      prev.title === next.title &&
      prev.collapsed === next.collapsed &&
      prev.childrenLength === next.childrenLength &&
      prev.depth === next.depth &&
      prev.isActive === next.isActive &&
      prev.isSelected === next.isSelected &&
      prev.isBookmarked === next.isBookmarked &&
      prev.setRefs === next.setRefs
      // prev.handleProps === next.handleProps // Muted just like in Block to prevent inline object rerenders
    );
  },
);
ExpEntryInner.displayName = "ExpEntryInner";

export default function ExpEntry({
  id,
  type,
  title,
  collapsed,
  childrenLength,
  depth,
  isActive,
  isSelected,
  isBookmarked,
}: {
  id: string;
  type: number;
  title: string;
  collapsed?: boolean;
  childrenLength?: number;
  depth: number;
  isActive: boolean;
  isSelected: boolean;
  isBookmarked: boolean;
}) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      // log.debug("setNodeRef", id);
      nodeRef.current = node;
      setNodeRef(node);
    },
    [setNodeRef],
  );

  useEffect(() => {
    if (!nodeRef.current) return;
    nodeRef.current.style.transform = DnDCSS.Translate.toString(transform) ?? "";
    nodeRef.current.style.transition = transition ?? "";
  }, [transform?.x, transform?.y, transform?.scaleX, transform?.scaleY, transition]);

  return (
    <ExpEntryInner
      id={id}
      type={type}
      title={title}
      collapsed={collapsed}
      childrenLength={childrenLength}
      depth={depth}
      isActive={isActive}
      isSelected={isSelected}
      isBookmarked={isBookmarked}
      setRefs={setRefs}
      handleProps={{ attributes, listeners }}
    />
  );
}

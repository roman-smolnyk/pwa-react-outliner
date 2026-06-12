import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useSortable } from "@dnd-kit/sortable";
import { CSS as DnDCSS } from "@dnd-kit/utilities";
import log from "loglevel";
import { CircleIcon, CircleMinusIcon, PlusCircleIcon } from "lucide-react";
import { memo, useCallback, useLayoutEffect, useRef } from "react";
import { INDENT } from "../../../config.tsx";
import { handleBlockCheckbox, handleBlockCollapseToggle } from "../../api/api.tsx";
import useStore from "../../store/useStore.tsx";
import DropIndicator from "../Common/DropIndicator.tsx";
import IndentGuides from "../Common/IndentGuide.tsx";
import BlockContent from "./BlockContent.tsx";
import { BlockOptions } from "./BlockOptions.tsx";

function HandleButton({
  id,
  collapsed,
  childrenLength,
  attributes,
  listeners,
  ...props
}: {
  id: string;
  collapsed: boolean;
  childrenLength: number;
  attributes: any;
  listeners: any;
}) {
  return (
    <Button
      className=""
      variant="bare"
      size="micro"
      title={id}
      {...attributes}
      {...listeners}
      onClick={() => {
        log.debug("onPointerUpCapture");
        if (childrenLength !== 0) {
          handleBlockCollapseToggle(id);
        }
      }}
    >
      {childrenLength > 0 ? (
        collapsed ? (
          <PlusCircleIcon className="size-3" strokeWidth={2.5} />
        ) : (
          <CircleMinusIcon className="size-3" strokeWidth={2.5} />
        )
      ) : (
        <CircleIcon className="fill-primary size-2" fill="none" />
      )}
    </Button>
  );
}

// ! Custom memo condition used
const BlockInner = memo(
  function BlockInner({
    id,
    content,
    collapsed,
    childrenLength,
    depth,
    isRoot,
    isActive,
    isChecked,
    setRefs,
    handleProps,
  }: {
    id: string;
    content: string;
    collapsed: boolean;
    childrenLength: number;
    depth: number;
    isRoot: boolean;
    isActive: boolean;
    isChecked: boolean;
    setRefs: any;
    handleProps: any;
    // TODO: Add types
  }) {
    // log.debug("BlockInner", id);
    const isChekboxSelectionActive = useStore((s) => s.isCheckboxSelectionActive);

    if (isRoot) depth = 1;

    return (
      <div className={`Block relative ${isRoot ? "mb-5" : ""}`} ref={setRefs} style={{ paddingLeft: `${INDENT * (depth - 1)}px` }} data-block-id={id}>
        <IndentGuides id={id} depth={depth} />
        <div className={`flex items-start`}>
          {isActive ? (
            <DropIndicator />
          ) : (
            <>
              <div className="mt-0.5 flex items-center justify-center gap-1">
                {!isRoot && isChekboxSelectionActive && (
                  <Checkbox
                    checked={isChecked}
                    onCheckedChange={() => {}}
                    onPointerDown={(e) => {
                      handleBlockCheckbox(id, !isChecked);
                    }}
                    onPointerOver={(e) => {
                      if (e.ctrlKey && e.buttons === 1) {
                        if (!isChecked) handleBlockCheckbox(id, true);
                      }
                    }}
                  />
                )}
                {!isRoot && <HandleButton id={id} collapsed={collapsed} childrenLength={childrenLength} {...handleProps} />}
              </div>

              {/* // ! ID */}
              {/* <div className="text-xs min-w-10">{id.slice(0, 5)}</div> */}

              <div className="min-w-0 flex-1 flex">
                <BlockContent id={id} content={content} />
              </div>

              <div className="mt-0.5 flex items-center justify-center">
                <BlockOptions id={id} isRoot={isRoot} />
              </div>
            </>
          )}
        </div>
      </div>
    );
  },
  (prev, next) => {
    return (
      prev.id === next.id &&
      prev.content === next.content &&
      prev.collapsed === next.collapsed &&
      prev.childrenLength === next.childrenLength &&
      prev.depth === next.depth &&
      prev.isRoot === next.isRoot &&
      prev.isActive === next.isActive &&
      prev.isChecked === next.isChecked &&
      prev.setRefs === next.setRefs
      // prev.handleProps === next.handleProps // Causes rerenders. should be muted
    );
  },
);
BlockInner.displayName = "BlockInner";

export default function Block({
  id,
  content,
  collapsed,
  childrenLength,
  depth,
  isRoot,
  isActive,
  isChecked,
}: {
  id: string;
  content: string;
  collapsed: boolean;
  childrenLength: number;
  depth: number;
  isRoot: boolean;
  isActive: boolean;
  isChecked: boolean;
}) {
  // log.debug("Block", id, isChecked);
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

  useLayoutEffect(() => {
    if (!nodeRef.current) return;
    // log.debug("TRANSFORM", id);
    nodeRef.current.style.transform = DnDCSS.Translate.toString(transform) ?? "";
    nodeRef.current.style.transition = transition ?? "";
  }, [transform?.x, transform?.y, transform?.scaleX, transform?.scaleY, transition]);

  // TODO: Find which one is faster

  // const style: React.CSSProperties = useMemo(() => {
  //   return {
  //     transform: DnDCSS.Translate.toString(transform) ?? "",
  //     transition: transition ?? "",
  //   };
  // }, [transform?.x, transform?.y, transform?.scaleX, transform?.scaleY, transition]);

  return (
    <BlockInner
      id={id}
      content={content}
      collapsed={collapsed}
      childrenLength={childrenLength}
      depth={depth}
      isRoot={isRoot}
      isActive={isActive}
      isChecked={isChecked}
      setRefs={setRefs}
      handleProps={{ attributes, listeners }}
    />
  );
}

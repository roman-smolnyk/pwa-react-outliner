import { autoUpdate, flip, FloatingPortal, useClick, useDismiss, useFloating, useInteractions, useRole } from "@floating-ui/react";
import { getItem } from "esm-treero-api";
import {
  ArrowDownNarrowWideIcon,
  EllipsisVerticalIcon,
  InboxIcon,
  LinkIcon,
  MinusIcon,
  MoveIcon,
  PlusIcon,
  Trash2Icon,
  UploadIcon,
  ZoomInIcon
} from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import { openBlock } from "../../api/api";
import yjs from "../../store/yjsManager";
import FloatingMenuItem from "../Common/FloatingMenuItem";

export function BlockOptions({ id, isRoot }: { id: string; isRoot: boolean }) {
  const [isOpened, setIsOpened] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpened,
    onOpenChange: setIsOpened,
    placement: "bottom-end",
    middleware: [flip()],
    whileElementsMounted: autoUpdate,
  });

  const click = useClick(context, {
    event: "click",
  });

  const dismiss = useDismiss(context);
  const role = useRole(context, { role: "menu" });

  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);

  const yblock = getItem(yjs.yblocks, id);

  return (
    <>
      <button
        ref={refs.setReference}
        type="button"
        className="BlockOptions cursor-pointer min-h-5 min-w-5 active:scale-90 transition"
        {...getReferenceProps()}
      >
        {/* <i className="ph-bold ph-dots-three-vertical text-[1.2rem]"></i> */}
        {/* <div>BTN</div> */}
        <EllipsisVerticalIcon size={15} />
      </button>

      {isOpened && (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            className="w-40 py-2 z-100 bg-white shadow-lg rounded-md flex flex-col gap-1"
            {...getFloatingProps()}
          >
            <FloatingMenuItem
              className="ZoomIntoNode"
              icon={<ZoomInIcon className="w-full h-full" />}
              label="Zoom In"
              onClick={() => {
                openBlock(id);
                setIsOpened(false);
                // TreeRoAPI.openBlock(id);
              }}
            />
            <FloatingMenuItem
              className="text-yellow-400"
              icon={<MoveIcon className="w-full h-full" />}
              label="Move to"
              onClick={() => {
                setIsOpened(false);
              }}
            />
            <FloatingMenuItem
              className="text-yellow-400"
              icon={<PlusIcon className="w-full h-full" />}
              label="Expand All"
              onClick={() => {
                setIsOpened(false);
              }}
            />
            <FloatingMenuItem
              className="text-yellow-400"
              icon={<MinusIcon className="w-full h-full" />}
              label="Collapse All"
              onClick={() => {
                setIsOpened(false);
              }}
            />
            <FloatingMenuItem
              className="text-yellow-400"
              icon={<ArrowDownNarrowWideIcon className="w-full h-full" />}
              label="Sort"
              onClick={() => {
                setIsOpened(false);
              }}
            />
            <FloatingMenuItem
              className="text-yellow-400"
              icon={<InboxIcon className="w-full h-full" />}
              label="Set as Inbox"
              onClick={() => {
                setIsOpened(false);
              }}
            />
            <FloatingMenuItem
              className="text-yellow-400"
              icon={<UploadIcon className="w-full h-full" />}
              label="Export"
              onClick={() => {
                setIsOpened(false);
              }}
            />
            <FloatingMenuItem
              className="CopyNodeLink"
              icon={<LinkIcon className="w-full h-full" />}
              label="Copy link"
              onClick={async () => {
                setIsOpened(false);
                const nodeUrl = `${window.location.origin}/${id}`;
                try {
                  await navigator.clipboard.writeText(nodeUrl);
                  toast("Copied", {
                    containerId: "toaster",
                    className: "min-h-0! h-10! w-30! rounded-xl! top-5! sm:top-0! right-5! sm:right-0!",
                  });
                } catch (err) {
                  toast.error("Failed to copy", { containerId: "toaster" });
                  console.error("Failed to copy:", err);
                }
              }}
            />
            <FloatingMenuItem
              className="DeleteNode text-red-600"
              icon={<Trash2Icon className="w-full h-full" />}
              label="Delete"
              onClick={() => {
                setIsOpened(false);
                // block.delete();
              }}
            />
          </div>
        </FloatingPortal>
      )}
    </>
  );
}

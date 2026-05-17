import { autoUpdate, flip, FloatingPortal, shift, useClick, useDismiss, useFloating, useInteractions, useRole } from "@floating-ui/react";
import { deleteBlock, getItem } from "esm-treero-api";
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
  ZoomInIcon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import { copyToClipboard, handleBlockDelete, handleBlockOpen } from "../../api/api";
import yjs from "../../store/yjsManager";
import FloatingMenuItem from "../Common/FloatingMenuItem";

// function MobileSheet({ open, onClose, children }) {
//   return (
//     <>
//       {/* Backdrop */}
//       <div
//         className={`fixed inset-0 bg-black/40 transition-opacity z-100 ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
//         onClick={onClose}
//       />

//       {/* Sheet */}
//       <div
//         className={`
//           fixed left-0 right-0 bottom-0
//           bg-theme-bg rounded-t-xl shadow-xl
//           transition-transform duration-300 z-100
//           ${open ? "translate-y-0" : "translate-y-full"}
//         `}
//         style={{ maxHeight: "85vh" }}
//       >
//         <div className="p-4 overflow-y-auto max-h-[85vh]">{children}</div>
//       </div>
//     </>
//   );
// }

export function BlockOptions({ id, isRoot }: { id: string; isRoot: boolean }) {
  const [isOpened, setIsOpened] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpened,
    onOpenChange: setIsOpened,
    placement: "bottom-end",
    middleware: [flip(), shift()],
    whileElementsMounted: autoUpdate,
  });

  const click = useClick(context, {
    event: "click",
  });

  const dismiss = useDismiss(context);
  const role = useRole(context, { role: "menu" });

  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);

  return (
    <>
      <button ref={refs.setReference} type="button" className="BlockOptions cursor-pointer min-h-5 min-w-5" {...getReferenceProps()}>
        <EllipsisVerticalIcon size={15} />
      </button>

      {isOpened && (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            className="w-40 py-2 z-100 bg-theme-bg shadow-lg rounded-md flex flex-col gap-1"
            {...getFloatingProps()}
          >
            <FloatingMenuItem
              className="ZoomIntoNode"
              icon={<ZoomInIcon className="w-full h-full" />}
              label="Zoom In"
              onClick={async () => {
                setIsOpened(false);
                await handleBlockOpen(id);
                // TreeRoAPI.openBlock(id);
              }}
            />
            <FloatingMenuItem
              className="text-theme-warning"
              icon={<MoveIcon className="w-full h-full" />}
              label="Move to"
              onClick={() => {
                setIsOpened(false);
              }}
            />
            <FloatingMenuItem
              className="text-theme-warning"
              icon={<PlusIcon className="w-full h-full" />}
              label="Expand All"
              onClick={() => {
                setIsOpened(false);
              }}
            />
            <FloatingMenuItem
              className="text-theme-warning"
              icon={<MinusIcon className="w-full h-full" />}
              label="Collapse All"
              onClick={() => {
                setIsOpened(false);
              }}
            />
            <FloatingMenuItem
              className="text-theme-warning"
              icon={<ArrowDownNarrowWideIcon className="w-full h-full" />}
              label="Sort"
              onClick={() => {
                setIsOpened(false);
              }}
            />
            <FloatingMenuItem
              className="text-theme-warning"
              icon={<InboxIcon className="w-full h-full" />}
              label="Set as Inbox"
              onClick={() => {
                setIsOpened(false);
              }}
            />
            <FloatingMenuItem
              className="text-theme-warning"
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
                await copyToClipboard(`${window.location.origin}/#${id}`);
                toast("Copied", { containerId: "toaster" });
              }}
            />
            {!isRoot && (
              <FloatingMenuItem
                className="DeleteNode text-theme-error"
                icon={<Trash2Icon className="w-full h-full" />}
                label="Delete"
                onClick={() => {
                  setIsOpened(false);
                  deleteBlock(yjs.ydoc, id);
                }}
              />
            )}
          </div>
        </FloatingPortal>
      )}
    </>
  );
}

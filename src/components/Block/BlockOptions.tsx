import { autoUpdate, flip, FloatingPortal, offset, shift, useClick, useDismiss, useFloating, useInteractions, useRole } from "@floating-ui/react";
import { deleteBlock } from "esm-treero-api";
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
import { copyToClipboard, handleBlockOpen } from "../../api/api";
import yjs from "../../store/yjsManager";
import FloatingMenuButton from "../Common/FloatingMenuButton";
import LucideIcon from "../Common/LucideIcon";
import BlockButton from "./BlockButton";

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
    placement: "bottom-start",
    middleware: [offset(10), flip(), shift()],
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
      <BlockButton className="BlockOptions" ref={refs.setReference} {...getReferenceProps()}>
        <LucideIcon className="size-auto! [&>svg]:w-auto! [&>svg]:h-auto!" icon={<EllipsisVerticalIcon size={15} />} />
      </BlockButton>
      {/* <button ref={refs.setReference} type="button" className="BlockOptions cursor-pointer min-h-5 min-w-5" {...getReferenceProps()}>
        <EllipsisVerticalIcon size={15} />
      </button> */}

      {isOpened && (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            className="py-1 rounded-md bg-theme-bg shadow-lg z-100 flex flex-col"
            {...getFloatingProps()}
          >
            <FloatingMenuButton
              className="ZoomIn"
              onClick={async () => {
                setIsOpened(false);
                await handleBlockOpen(id);
              }}
            >
              <LucideIcon icon={<ZoomInIcon />} />
              <div>Zoom in</div>
            </FloatingMenuButton>
            <FloatingMenuButton
              className="MoveTo text-theme-warning"
              onClick={() => {
                setIsOpened(false);
              }}
            >
              <LucideIcon icon={<MoveIcon />} />
              <div>Move to</div>
            </FloatingMenuButton>
            <FloatingMenuButton
              className="ExpandAll text-theme-warning"
              onClick={() => {
                setIsOpened(false);
              }}
            >
              <LucideIcon icon={<PlusIcon />} />
              <div>Expand All</div>
            </FloatingMenuButton>
            <FloatingMenuButton
              className="CollapseAll text-theme-warning"
              onClick={() => {
                setIsOpened(false);
              }}
            >
              <LucideIcon icon={<MinusIcon />} />
              <div>Collapse All</div>
            </FloatingMenuButton>
            <FloatingMenuButton
              className="Sort text-theme-warning"
              onClick={() => {
                setIsOpened(false);
              }}
            >
              <LucideIcon icon={<ArrowDownNarrowWideIcon />} />
              <div>Sort</div>
            </FloatingMenuButton>
            <FloatingMenuButton
              className="SetAsInbox text-theme-warning"
              onClick={() => {
                setIsOpened(false);
              }}
            >
              <LucideIcon icon={<InboxIcon />} />
              <div>Set as Inbox</div>
            </FloatingMenuButton>
            <FloatingMenuButton
              className="Export text-theme-warning"
              onClick={() => {
                setIsOpened(false);
              }}
            >
              <LucideIcon icon={<UploadIcon />} />
              <div>Export</div>
            </FloatingMenuButton>
            <FloatingMenuButton
              className="CopyLink"
              onClick={async () => {
                setIsOpened(false);
                await copyToClipboard(`${window.location.origin}/#${id}`);
                toast("Copied", { containerId: "toaster" });
              }}
            >
              <LucideIcon icon={<LinkIcon />} />
              <div>Copy link</div>
            </FloatingMenuButton>
            {!isRoot && (
              <FloatingMenuButton
                className="Delete text-theme-error"
                onClick={() => {
                  setIsOpened(false);
                  deleteBlock(yjs.ydoc, id);
                }}
              >
                <LucideIcon icon={<Trash2Icon />} />
                <div>Delete</div>
              </FloatingMenuButton>
            )}
          </div>
        </FloatingPortal>
      )}
    </>
  );
}

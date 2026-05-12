import { autoUpdate, flip, FloatingPortal, useClick, useDismiss, useFloating, useInteractions, useRole } from "@floating-ui/react";
import { EllipsisVerticalIcon, InboxIcon, Share2Icon, SquarePenIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import FloatingMenuItem from "../Common/FloatingMenuItem";

export default function ExpEntryOptions({ id, setIsEdit }: { id: string; setIsEdit: (v: boolean) => void }) {
  const [open, setOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
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

  return (
    <>
      <button
        ref={refs.setReference}
        type="button"
        className="cursor-pointer active:scale-90 transition flex items-center justify-center"
        {...getReferenceProps()}
      >
        {/* <i className="ph-bold ph-dots-three-vertical text-[1.2rem]"></i> */}
        <EllipsisVerticalIcon size={15} />
      </button>

      {open && (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            className="w-40 py-2 z-100 bg-white shadow-lg rounded-md flex flex-col gap-1"
            {...getFloatingProps()}
          >
            <FloatingMenuItem
              className="RenameDocument"
              icon={<SquarePenIcon className="w-full h-full" />}
              label="Rename"
              onClick={() => {
                setOpen(false);
                setIsEdit(true);
              }}
            />
            <FloatingMenuItem
              className="text-yellow-400"
              icon={<InboxIcon className="w-full h-full" />}
              label="Set as Inbox"
              onClick={() => {
                setOpen(false);
              }}
            />
            <FloatingMenuItem
              className="text-yellow-400"
              icon={<Share2Icon className="w-full h-full" />}
              label="Share"
              onClick={() => {
                setOpen(false);
              }}
            />
            <FloatingMenuItem
              className="DeleteDocument text-red-600"
              icon={<Trash2Icon className="w-full h-full" />}
              label="Delete"
              onClick={() => {
                setOpen(false);
                // TreeRoAPI.deleteDocument(documentId);
              }}
            />
          </div>
        </FloatingPortal>
      )}
    </>
  );
}

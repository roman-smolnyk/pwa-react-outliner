import { autoUpdate, flip, FloatingPortal, useClick, useDismiss, useFloating, useInteractions, useRole } from "@floating-ui/react";
import { EllipsisVerticalIcon, FilePlusIcon, FolderPlusIcon, InboxIcon, Share2Icon, SquarePenIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import FloatingMenuItem from "../Common/FloatingMenuItem";
import { COLLECTION_TYPE, PAGE_TYPE } from "esm-treero-api";
import { handleCollectionAdd, handleCollectionDelete, handlePageAdd, handlePageDelete } from "../../api/api";

export default function ExpEntryOptions({ id, type, setIsEdit }: { id: string; type: number; setIsEdit: (v: boolean) => void }) {
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
      <button ref={refs.setReference} type="button" className="h-6 cursor-pointer flex items-center justify-center" {...getReferenceProps()}>
        {/* <i className="ph-bold ph-dots-three-vertical text-[1.2rem]"></i> */}
        <EllipsisVerticalIcon size={15} />
      </button>

      {open && (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            className="w-40 py-2 z-100 bg-theme-bg shadow-lg rounded-md flex flex-col gap-1"
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
            {type === COLLECTION_TYPE && (
              <>
                <FloatingMenuItem
                  className="AddNewDocument"
                  icon={<FilePlusIcon className="w-full h-full" />}
                  label="New Document"
                  onClick={() => {
                    setOpen(false);
                    handlePageAdd(id);
                  }}
                />
                <FloatingMenuItem
                  className="AddNewFolder"
                  icon={<FolderPlusIcon className="w-full h-full" />}
                  label="New Folder"
                  onClick={() => {
                    setOpen(false);
                    handleCollectionAdd(id);
                  }}
                />
              </>
            )}

            {/* <FloatingMenuItem
              className=""
              icon={<Share2Icon className="w-full h-full" />}
              label="Share"
              onClick={() => {
                setOpen(false);
              }}
            /> */}
            <FloatingMenuItem
              className="DeleteDocument text-theme-error"
              icon={<Trash2Icon className="w-full h-full" />}
              label="Delete"
              onClick={() => {
                setOpen(false);
                if (type === COLLECTION_TYPE) {
                  handleCollectionDelete(id);
                } else if (type === PAGE_TYPE) {
                  handlePageDelete(id);
                }
              }}
            />
          </div>
        </FloatingPortal>
      )}
    </>
  );
}

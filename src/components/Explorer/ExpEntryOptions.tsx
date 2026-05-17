import { autoUpdate, flip, FloatingPortal, offset, shift, useClick, useDismiss, useFloating, useInteractions, useRole } from "@floating-ui/react";
import { EllipsisVerticalIcon, FilePlusIcon, FolderPlusIcon, InboxIcon, Share2Icon, SquarePenIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import FloatingMenuButton from "../Common/FloatingMenuButton";
import { COLLECTION_TYPE, PAGE_TYPE } from "esm-treero-api";
import { handleCollectionAdd, handleCollectionDelete, handlePageAdd, handlePageDelete } from "../../api/api";
import LucideIcon from "../Common/LucideIcon";

export default function ExpEntryOptions({ id, type, setIsEdit }: { id: string; type: number; setIsEdit: (v: boolean) => void }) {
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
      <button
        ref={refs.setReference}
        type="button"
        className="flex-none w-5 h-7 sm:w-4 sm:h-6 cursor-pointer flex items-center justify-center"
        {...getReferenceProps()}
      >
        <LucideIcon className="h-5! sm:h-4! [&>svg]:w-auto!" icon={<EllipsisVerticalIcon />} />
      </button>

      {isOpened && (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            className="py-1 rounded-md bg-theme-bg shadow-lg z-100 flex flex-col"
            {...getFloatingProps()}
          >
            <FloatingMenuButton
              className="Rename"
              onClick={() => {
                setIsOpened(false);
                setIsEdit(true);
              }}
            >
              <LucideIcon icon={<SquarePenIcon />} />
              <div>Rename</div>
            </FloatingMenuButton>
            {type === COLLECTION_TYPE && (
              <>
                <FloatingMenuButton
                  className="NewDocument"
                  onClick={() => {
                    setIsOpened(false);
                    handlePageAdd(id);
                  }}
                >
                  <LucideIcon icon={<FilePlusIcon />} />
                  <div>New Document</div>
                </FloatingMenuButton>
                <FloatingMenuButton
                  className="New Folder"
                  onClick={() => {
                    setIsOpened(false);
                    handleCollectionAdd(id);
                  }}
                >
                  <LucideIcon icon={<FolderPlusIcon />} />
                  <div>New Folder</div>
                </FloatingMenuButton>
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
            <FloatingMenuButton
              className="Delete text-theme-error"
              onClick={() => {
                setIsOpened(false);
                if (type === COLLECTION_TYPE) {
                  handleCollectionDelete(id);
                } else if (type === PAGE_TYPE) {
                  handlePageDelete(id);
                }
              }}
            >
              <LucideIcon icon={<Trash2Icon />} />
              <div>Delete</div>
            </FloatingMenuButton>
          </div>
        </FloatingPortal>
      )}
    </>
  );
}

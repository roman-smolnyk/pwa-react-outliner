import { COLLECTION_TYPE, PAGE_TYPE } from "esm-treero-api";
import { EllipsisVerticalIcon, FilePlusIcon, FolderPlusIcon, SquarePenIcon, Trash2Icon } from "lucide-react";
import { handleCollectionAdd, handleCollectionDelete, handlePageAdd, handlePageDelete } from "../../api/api";
import FloatingMenu from "../Common/FloatingMenu";
import FloatingMenuButton from "../Common/FloatingMenuButton";
import LucideIcon from "../Common/LucideIcon";
import Button from "../Common/Button";

export default function ExpEntryOptions({ id, type, setIsEdit }: { id: string; type: number; setIsEdit: (v: boolean) => void }) {
  return (
    <FloatingMenu
      trigger={
        // <button className="flex-none w-5 h-7 sm:w-4 sm:h-6 cursor-pointer flex items-center justify-center" type="button">
        //   <LucideIcon className="h-5! sm:h-4! [&>svg]:w-auto!" icon={<EllipsisVerticalIcon />} />
        // </button>
        <Button className="ExpEntryOptions size-4!">
          <LucideIcon className="size-auto!" icon={<EllipsisVerticalIcon />} />
        </Button>
      }
    >
      <FloatingMenuButton
        className="Rename"
        onClick={() => {
          // setIsOpened(false);
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
              // setIsOpened(false);
              handlePageAdd(id);
            }}
          >
            <LucideIcon icon={<FilePlusIcon />} />
            <div>New Document</div>
          </FloatingMenuButton>
          <FloatingMenuButton
            className="New Folder"
            onClick={() => {
              // setIsOpened(false);
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
        className="Delete text-error!"
        onClick={() => {
          // setIsOpened(false);
          if (type === COLLECTION_TYPE) {
            handleCollectionDelete(id);
          } else if (type === PAGE_TYPE) {
            handlePageDelete(id);
          }
        }}
      >
        <LucideIcon icon={<Trash2Icon className="text-error" />} />
        <div>Delete</div>
      </FloatingMenuButton>
    </FloatingMenu>
  );
}

import { getItem, getItemDescendants, isRootItem } from "esm-treero-api";
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
import { toast } from "react-toastify";
import { copyToClipboard, handleBlockDelete, handleBlockOpen } from "../../api/api";
import yjs from "../../store/yjsManager";
import Button from "../Common/Button";
import FloatingMenu from "../Common/FloatingMenu";
import FloatingMenuButton from "../Common/FloatingMenuButton";
import LucideIcon from "../Common/LucideIcon";

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
//           bg-background rounded-t-xl shadow-xl
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
  return (
    <FloatingMenu
      trigger={
        <Button className="BlockOptions size-4! mt-1">
          <LucideIcon className="size-auto!" icon={<EllipsisVerticalIcon />} />
        </Button>
      }
    >
      <FloatingMenuButton
        className="ZoomIn"
        onClick={async () => {
          // setIsOpened(false);
          await handleBlockOpen(id);
        }}
      >
        <LucideIcon icon={<ZoomInIcon />} />
        <div>Zoom in</div>
      </FloatingMenuButton>
      {!isRoot && (
        <FloatingMenuButton
          className="MoveTo text-warning"
          onClick={() => {
            // setIsOpened(false);
          }}
        >
          <LucideIcon icon={<MoveIcon className="text-warning!" />} />
          <div>Move to</div>
        </FloatingMenuButton>
      )}
      <FloatingMenuButton
        className="ExpandAll "
        onClick={() => {
          if (!isRootItem(yjs.yblocks, id)) {
            getItem(yjs.yblocks, id).set("collapsed", false);
          }
          for (const yitem of getItemDescendants(yjs.yblocks, id)) {
            yitem.set("collapsed", false);
          }
        }}
      >
        <LucideIcon icon={<PlusIcon className="" />} />
        <div>Expand All</div>
      </FloatingMenuButton>
      <FloatingMenuButton
        className="CollapseAll "
        onClick={() => {
          if (!isRootItem(yjs.yblocks, id)) {
            getItem(yjs.yblocks, id).set("collapsed", true);
          }
          for (const yitem of getItemDescendants(yjs.yblocks, id)) {
            yitem.set("collapsed", true);
          }
        }}
      >
        <LucideIcon icon={<MinusIcon className="" />} />
        <div>Collapse All</div>
      </FloatingMenuButton>
      <FloatingMenuButton className="Sort text-warning" onClick={() => {}}>
        <LucideIcon icon={<ArrowDownNarrowWideIcon className="text-warning!" />} />
        <div>Sort</div>
      </FloatingMenuButton>
      <FloatingMenuButton
        className="SetAsInbox text-warning"
        onClick={() => {
          // setIsOpened(false);
        }}
      >
        <LucideIcon icon={<InboxIcon className="text-warning!" />} />
        <div>Set as Inbox</div>
      </FloatingMenuButton>
      <FloatingMenuButton
        className="Export text-warning"
        onClick={() => {
          // setIsOpened(false);
        }}
      >
        <LucideIcon icon={<UploadIcon className="text-warning!" />} />
        <div>Export</div>
      </FloatingMenuButton>
      <FloatingMenuButton
        className="CopyLink"
        onClick={async () => {
          // setIsOpened(false);
          await copyToClipboard(`${window.location.origin}/#${id}`);
          toast("Copied", { containerId: "toaster" });
        }}
      >
        <LucideIcon icon={<LinkIcon />} />
        <div>Copy link</div>
      </FloatingMenuButton>
      {!isRoot && (
        <FloatingMenuButton
          className="Delete text-error!"
          onClick={() => {
            // setIsOpened(false);
            handleBlockDelete(id);
          }}
        >
          <LucideIcon icon={<Trash2Icon className="text-error!" />} />
          <div>Delete</div>
        </FloatingMenuButton>
      )}
    </FloatingMenu>
  );
}

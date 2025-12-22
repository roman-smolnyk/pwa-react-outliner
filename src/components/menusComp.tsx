import { autoUpdate, flip, FloatingPortal, offset, shift, useClick, useDismiss, useFloating, useInteractions, useRole } from "@floating-ui/react";
import {
  ArrowDownNarrowWideIcon,
  BoltIcon,
  EllipsisVerticalIcon,
  FilePlusIcon,
  FolderPlusIcon,
  HardDriveDownloadIcon,
  HardDriveUploadIcon,
  InboxIcon,
  LinkIcon,
  LogInIcon,
  MinusIcon,
  PlusIcon,
  Share2Icon,
  SquarePenIcon,
  Trash2Icon,
  UploadIcon,
  UserRoundIcon,
  ZoomInIcon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import { TreeRoAPI } from "../api";

function MenuItem({
  icon,
  label,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { icon: React.ReactNode; label: string; danger?: boolean; onClick: () => void }) {
  return (
    <button type="button" className={`p-1 text-gray-700 hover:bg-gray-200 flex gap-2 items-center ${className ?? ""}`} {...props}>
      <div className="size-6 md:size-5">{icon}</div>
      <span className="text-base md:text-sm">{label}</span>
    </button>
  );
}

export default function MainMenuComponent() {
  const [open, setOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: "bottom-end",
    middleware: [offset(6), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });

  const click = useClick(context, {
    event: "mousedown",
  });

  const dismiss = useDismiss(context);
  const role = useRole(context, { role: "menu" });

  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);

  return (
    <>
      <button ref={refs.setReference} type="button" className="cursor-pointer active:scale-90 transition" {...getReferenceProps()}>
        <EllipsisVerticalIcon className="text-gray-600" />
      </button>

      {open && (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            className="w-40 py-2 z-100 bg-white shadow-lg rounded-md flex flex-col gap-1"
            {...getFloatingProps()}
          >
            <MenuItem
              className="CopyToken"
              icon={<UserRoundIcon className="w-full h-full" />}
              label="Copy Token"
              onClick={() => {
                setOpen(false);
                navigator.clipboard
                  .writeText(TreeRoAPI.getRoomToken() as string)
                  .then(() => {
                    toast("Copied", { containerId: "main", className: "min-h-0! h-10! w-30! rounded-xl! top-5! md:top-0! right-5! md:right-0!" });
                  })
                  .catch(() => toast.error("Failed to copy"));
              }}
            />
            <MenuItem
              className="text-yellow-400"
              icon={<BoltIcon className="w-full h-full" />}
              label="Settings"
              onClick={() => {
                setOpen(false);
              }}
            />
            <MenuItem
              className="text-yellow-400"
              icon={<HardDriveDownloadIcon className="w-full h-full" />}
              label="Export Backup"
              onClick={() => {
                setOpen(false);
              }}
            />
            <MenuItem
              className="text-yellow-400"
              icon={<HardDriveUploadIcon className="w-full h-full" />}
              label="Import Backup"
              onClick={() => {
                setOpen(false);
              }}
            />
            <hr className="m-1 border-gray-300" />
            <MenuItem
              className="Exit text-red-600"
              icon={<LogInIcon className="w-full h-full" />}
              label="Exit"
              onClick={() => {
                setOpen(false);
                if (confirm("All data on this device will be wiped. Are you sure?")) {
                  TreeRoAPI.clearData(true);
                }
              }}
            />
          </div>
        </FloatingPortal>
      )}
    </>
  );
}

export function NodeOptionsComponent({ nodeId }: { nodeId: string }) {
  const [open, setOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: "bottom-end",
    middleware: [flip()],
    whileElementsMounted: autoUpdate,
  });

  const click = useClick(context, {
    event: "mousedown",
  });

  const dismiss = useDismiss(context);
  const role = useRole(context, { role: "menu" });

  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);

  return (
    <>
      <button ref={refs.setReference} type="button" className="cursor-pointer active:scale-90 transition" {...getReferenceProps()}>
        <i className="ph-bold ph-dots-three-vertical text-[1.2rem]"></i>
      </button>

      {open && (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            className="w-40 py-2 z-100 bg-white shadow-lg rounded-md flex flex-col gap-1"
            {...getFloatingProps()}
          >
            <MenuItem
              className="text-yellow-400"
              icon={<ZoomInIcon className="w-full h-full" />}
              label="Zoom In"
              onClick={() => {
                setOpen(false);
              }}
            />
            <MenuItem
              className="text-yellow-400"
              icon={<PlusIcon className="w-full h-full" />}
              label="Expand All"
              onClick={() => {
                setOpen(false);
              }}
            />
            <MenuItem
              className="text-yellow-400"
              icon={<MinusIcon className="w-full h-full" />}
              label="Collapse All"
              onClick={() => {
                setOpen(false);
              }}
            />
            <MenuItem
              className="text-yellow-400"
              icon={<ArrowDownNarrowWideIcon className="w-full h-full" />}
              label="Sort"
              onClick={() => {
                setOpen(false);
              }}
            />
            <MenuItem
              className="text-yellow-400"
              icon={<InboxIcon className="w-full h-full" />}
              label="Set as Inbox"
              onClick={() => {
                setOpen(false);
              }}
            />
            <MenuItem
              className="text-yellow-400"
              icon={<UploadIcon className="w-full h-full" />}
              label="Export"
              onClick={() => {
                setOpen(false);
              }}
            />
            <MenuItem
              className="text-yellow-400"
              icon={<LinkIcon className="w-full h-full" />}
              label="Copy link"
              onClick={() => {
                setOpen(false);
              }}
            />
            <MenuItem
              className="DeleteNode text-red-600"
              icon={<Trash2Icon className="w-full h-full" />}
              label="Delete"
              onClick={() => {
                setOpen(false);
                TreeRoAPI.deleteNode(nodeId);
              }}
            />
          </div>
        </FloatingPortal>
      )}
    </>
  );
}

export function GroupOptionsComponent({ groupId, setRenaming }: { groupId: string; setRenaming: (v: boolean) => void }) {
  const [open, setOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: "bottom-end",
    middleware: [flip()],
    whileElementsMounted: autoUpdate,
  });

  const click = useClick(context, {
    event: "mousedown",
  });

  const dismiss = useDismiss(context);
  const role = useRole(context, { role: "menu" });

  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);

  return (
    <>
      <button ref={refs.setReference} type="button" className="cursor-pointer active:scale-90 transition" {...getReferenceProps()}>
        <i className="ph-bold ph-dots-three-vertical text-[1.2rem]"></i>
      </button>

      {open && (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            className="w-40 py-2 z-100 bg-white shadow-lg rounded-md flex flex-col gap-1"
            {...getFloatingProps()}
          >
            <MenuItem
              className="RenameGroup"
              icon={<SquarePenIcon className="w-full h-full" />}
              label="Rename"
              onClick={() => {
                setOpen(false);
                setRenaming(true);
              }}
            />
            <MenuItem
              className="CreateNewDocument"
              icon={<FilePlusIcon className="w-full h-full" />}
              label="New Document"
              onClick={() => {
                setOpen(false);
                TreeRoAPI.insertNewDocument(groupId, "New Document", 0);
                TreeRoAPI.updateGroup(groupId, { collapsed: false });
              }}
            />
            <MenuItem
              className="CreateNewGroup"
              icon={<FolderPlusIcon className="w-full h-full" />}
              label="New Folder"
              onClick={() => {
                setOpen(false);
                TreeRoAPI.insertNewGroup(groupId, "New Folder", 0);
                TreeRoAPI.updateGroup(groupId, { collapsed: false });
              }}
            />
            <MenuItem
              className="DeleteGroup text-red-600"
              icon={<Trash2Icon className="w-full h-full" />}
              label="Delete"
              onClick={() => {
                setOpen(false);
                TreeRoAPI.deleteGroup(groupId);
              }}
            />
          </div>
        </FloatingPortal>
      )}
    </>
  );
}

export function DocumentOptionsComponent({ documentId, setRenaming }: { documentId: string; setRenaming: (v: boolean) => void }) {
  const [open, setOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: "bottom-end",
    middleware: [flip()],
    whileElementsMounted: autoUpdate,
  });

  const click = useClick(context, {
    event: "mousedown",
  });

  const dismiss = useDismiss(context);
  const role = useRole(context, { role: "menu" });

  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);

  return (
    <>
      <button ref={refs.setReference} type="button" className="cursor-pointer active:scale-90 transition" {...getReferenceProps()}>
        <i className="ph-bold ph-dots-three-vertical text-[1.2rem]"></i>
      </button>

      {open && (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            className="w-40 py-2 z-100 bg-white shadow-lg rounded-md flex flex-col gap-1"
            {...getFloatingProps()}
          >
            <MenuItem
              className="RenameDocument"
              icon={<SquarePenIcon className="w-full h-full" />}
              label="Rename"
              onClick={() => {
                setOpen(false);
                setRenaming(true);
              }}
            />
            <MenuItem
              className="text-yellow-400"
              icon={<InboxIcon className="w-full h-full" />}
              label="Set as Inbox"
              onClick={() => {
                setOpen(false);
              }}
            />
            <MenuItem
              className="text-yellow-400"
              icon={<Share2Icon className="w-full h-full" />}
              label="Share"
              onClick={() => {
                setOpen(false);
              }}
            />
            <MenuItem
              className="DeleteDocument text-red-600"
              icon={<Trash2Icon className="w-full h-full" />}
              label="Delete"
              onClick={() => {
                setOpen(false);
                TreeRoAPI.deleteDocument(documentId);
              }}
            />
          </div>
        </FloatingPortal>
      )}
    </>
  );
}

import { autoUpdate, flip, FloatingPortal, offset, shift, useClick, useDismiss, useFloating, useInteractions, useRole } from "@floating-ui/react";
import {
  ArrowDownNarrowWideIcon,
  BoltIcon,
  EllipsisVerticalIcon,
  HardDriveDownloadIcon,
  HardDriveUploadIcon,
  InboxIcon,
  LinkIcon,
  LogInIcon,
  MinusIcon,
  PlusIcon,
  UploadIcon,
  UserRoundIcon,
  ZoomInIcon,
} from "lucide-react";
import { toast } from "react-toastify";
import { useState } from "react";
import { TreeRoAPI } from "../api";

function MenuItem({ icon, label, danger, onClick }: { icon: React.ReactNode; label: string; danger?: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`p-1 flex gap-2 items-center hover:bg-gray-200 ${danger ? "text-red-600" : "text-gray-700"}`}>
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
            className="w-40 py-2 z-50 bg-white shadow-lg rounded-md flex flex-col gap-1"
            {...getFloatingProps()}
          >
            <MenuItem
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
              icon={<BoltIcon className="w-full h-full" />}
              label="Settings"
              onClick={() => {
                setOpen(false);
              }}
            />
            <MenuItem
              icon={<HardDriveDownloadIcon className="w-full h-full" />}
              label="Export Backup"
              onClick={() => {
                setOpen(false);
              }}
            />
            <MenuItem
              icon={<HardDriveUploadIcon className="w-full h-full" />}
              label="Import Backup"
              onClick={() => {
                setOpen(false);
              }}
            />
            <hr className="m-1 border-gray-300" />
            <MenuItem
              icon={<LogInIcon className="w-full h-full" />}
              label="Exit"
              danger
              onClick={() => {
                setOpen(false);
                TreeRoAPI.clearData(true);
              }}
            />
          </div>
        </FloatingPortal>
      )}
    </>
  );
}

export function NodeOptionsComponent() {
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
            className="w-40 py-2 z-50 bg-white shadow-lg rounded-md flex flex-col gap-1"
            {...getFloatingProps()}
          >
            <MenuItem
              icon={<ZoomInIcon className="w-full h-full" />}
              label="Zoom In"
              onClick={() => {
                setOpen(false);
              }}
            />
            <MenuItem
              icon={<PlusIcon className="w-full h-full" />}
              label="Expand All"
              onClick={() => {
                setOpen(false);
              }}
            />
            <MenuItem
              icon={<MinusIcon className="w-full h-full" />}
              label="Collapse All"
              onClick={() => {
                setOpen(false);
              }}
            />
            <MenuItem
              icon={<ArrowDownNarrowWideIcon className="w-full h-full" />}
              label="Sort"
              onClick={() => {
                setOpen(false);
              }}
            />
            <MenuItem
              icon={<InboxIcon className="w-full h-full" />}
              label="Set as Inbox"
              onClick={() => {
                setOpen(false);
              }}
            />
            <MenuItem
              icon={<UploadIcon className="w-full h-full" />}
              label="Export"
              onClick={() => {
                setOpen(false);
              }}
            />
            <MenuItem
              icon={<LinkIcon className="w-full h-full" />}
              label="Copy link"
              onClick={() => {
                setOpen(false);
              }}
            />
          </div>
        </FloatingPortal>
      )}
    </>
  );
}

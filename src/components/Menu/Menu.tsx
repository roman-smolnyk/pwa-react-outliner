import { autoUpdate, flip, FloatingPortal, offset, shift, useClick, useDismiss, useFloating, useInteractions, useRole } from "@floating-ui/react";
import {
  BoltIcon,
  CircleArrowUpIcon,
  CircleQuestionMarkIcon,
  EllipsisVerticalIcon,
  HardDriveDownloadIcon,
  HardDriveUploadIcon,
  LogInIcon,
  UserRoundIcon,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "react-toastify";
import { copyToClipboard, hardPWAReload, logout } from "../../api/api";
import useZustandStore from "../../store/useZustandStore";
import FloatingMenuItem from "../Common/FloatingMenuItem";

declare const __APP_VERSION__: string;

export default function Menu() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: "bottom-end",
    middleware: [offset(6), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });

  const click = useClick(context, {
    event: "click", // if "mousedown" it prevents onblur to happen
  });

  const dismiss = useDismiss(context);
  const role = useRole(context, { role: "menu" });

  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);

  return (
    <>
      <button ref={refs.setReference} type="button" className="cursor-pointer" {...getReferenceProps()}>
        <EllipsisVerticalIcon className="text-theme-icon" />
      </button>

      {open && (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            className="w-50 sm:w-40 py-2 z-100 bg-theme-bg shadow-lg rounded-md flex flex-col gap-1"
            {...getFloatingProps()}
          >
            <FloatingMenuItem
              label="Copy Token"
              className="CopyToken"
              icon={<UserRoundIcon className="w-full h-full" />}
              onClick={async () => {
                setOpen(false);
                await copyToClipboard(useZustandStore.getState().roomToken as string);
                toast("Copied", { containerId: "toaster" });
              }}
            />
            <FloatingMenuItem
              label="Settings"
              className="text-theme-warning"
              icon={<BoltIcon className="w-full h-full" />}
              onClick={() => {
                setOpen(false);
              }}
            />
            <FloatingMenuItem
              label="Download Backup"
              className="text-theme-warning"
              icon={<HardDriveDownloadIcon className="w-full h-full" />}
              onClick={async () => {
                setOpen(false);
              }}
            />
            <FloatingMenuItem
              label="Import Backup"
              className="text-theme-warning"
              icon={<HardDriveUploadIcon className="w-full h-full" />}
              onClick={() => {
                console.debug("onClick", inputRef.current);
                inputRef.current?.click();
              }}
            ></FloatingMenuItem>

            <FloatingMenuItem
              label="Update"
              className=""
              icon={<CircleArrowUpIcon className="w-full h-full" />}
              onClick={async () => {
                setOpen(false);
                await hardPWAReload();
              }}
            ></FloatingMenuItem>

            <FloatingMenuItem
              label="Help"
              className=""
              icon={<CircleQuestionMarkIcon className="w-full h-full" />}
              onClick={() => {
                setOpen(false);
                toast(`${__APP_VERSION__}`, { containerId: "toaster" });
              }}
            />
            <hr className="m-1 border-gray-300" />

            <FloatingMenuItem
              label="Exit"
              className="Exit text-theme-error"
              icon={<LogInIcon className="w-full h-full" />}
              onClick={() => {
                setOpen(false);
                if (confirm("All data on this device will be wiped. Are you sure?")) {
                  logout();
                }
              }}
            />
          </div>
        </FloatingPortal>
      )}
    </>
  );
}

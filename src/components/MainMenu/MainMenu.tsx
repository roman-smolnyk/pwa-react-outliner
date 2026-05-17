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
import Button from "../Common/Button";
import FloatingMenuButton from "../Common/FloatingMenuButton";
import LucideIcon from "../Common/LucideIcon";

declare const __APP_VERSION__: string;

export default function MainMenu() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: "bottom-end",
    middleware: [offset(10), flip(), shift()],
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
      <Button title="MainMenu" className="Menu active:scale-100" ref={refs.setReference} {...getReferenceProps()}>
        <LucideIcon icon={<EllipsisVerticalIcon />} />
      </Button>

      {open && (
        <FloatingPortal>
          <div
            className="MainMenu py-1 rounded-md bg-theme-bg shadow-lg z-100 flex flex-col"
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
          >
            <FloatingMenuButton
              className="CopyToken"
              onClick={async () => {
                setOpen(false);
                await copyToClipboard(useZustandStore.getState().roomToken as string);
                toast("Copied", { containerId: "toaster" });
              }}
            >
              <LucideIcon icon={<UserRoundIcon />} />
              <div>Copy Token</div>
            </FloatingMenuButton>
            <FloatingMenuButton
              className="Settings text-theme-warning"
              onClick={() => {
                setOpen(false);
              }}
            >
              <LucideIcon icon={<BoltIcon />} />
              <div>Settings</div>
            </FloatingMenuButton>
            <FloatingMenuButton
              className="DownloadBackup text-theme-warning"
              onClick={async () => {
                setOpen(false);
              }}
            >
              <LucideIcon icon={<HardDriveDownloadIcon />} />
              <div>Download Backup</div>
            </FloatingMenuButton>
            <FloatingMenuButton
              className="ImportBackup text-theme-warning"
              onClick={() => {
                setOpen(false);
              }}
            >
              <LucideIcon icon={<HardDriveUploadIcon />} />
              <div>Import Backup</div>
            </FloatingMenuButton>

            <FloatingMenuButton
              className="Update"
              onClick={async () => {
                setOpen(false);
                await hardPWAReload();
              }}
            >
              <LucideIcon icon={<CircleArrowUpIcon />} />
              <div>Update</div>
            </FloatingMenuButton>

            <FloatingMenuButton
              className="Help"
              onClick={() => {
                setOpen(false);
                toast(`${__APP_VERSION__}`, { containerId: "toaster" });
              }}
            >
              <LucideIcon icon={<CircleQuestionMarkIcon />} />
              <div>Help</div>
            </FloatingMenuButton>
            <hr className="m-1 border-gray-300" />

            <FloatingMenuButton
              className="Exit text-theme-error"
              onClick={() => {
                setOpen(false);
                if (confirm("All data on this device will be wiped. Are you sure?")) {
                  logout();
                }
              }}
            >
              <LucideIcon icon={<LogInIcon />} />
              <div>Exit</div>
            </FloatingMenuButton>
          </div>
        </FloatingPortal>
      )}
    </>
  );
}

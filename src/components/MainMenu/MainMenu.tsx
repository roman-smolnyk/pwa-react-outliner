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
import { toast } from "react-toastify";
import { copyToClipboard, hardPWAReload, logout } from "../../api/api";
import useZustandStore from "../../store/useZustandStore";
import Button from "../Common/Button";
import FloatingMenu from "../Common/FloatingMenu";
import FloatingMenuButton from "../Common/FloatingMenuButton";
import LucideIcon from "../Common/LucideIcon";

declare const __APP_VERSION__: string;

export default function MainMenu() {
  return (
    <FloatingMenu placement="bottom-end" title="Main Menu">
      <FloatingMenuButton
        className="CopyToken"
        onClick={async () => {
          // setOpen(false);
          await copyToClipboard(useZustandStore.getState().roomToken as string);
          toast("Copied", { containerId: "toaster" });
        }}
      >
        <LucideIcon icon={<UserRoundIcon />} />
        <div>Copy Token</div>
      </FloatingMenuButton>
      <FloatingMenuButton
        className="Settings text-warning"
        onClick={() => {
          // setOpen(false);
        }}
      >
        <LucideIcon icon={<BoltIcon />} />
        <div>Settings</div>
      </FloatingMenuButton>
      <FloatingMenuButton
        className="DownloadBackup text-warning"
        onClick={async () => {
          // setOpen(false);
        }}
      >
        <LucideIcon icon={<HardDriveDownloadIcon />} />
        <div>Download Backup</div>
      </FloatingMenuButton>
      <FloatingMenuButton
        className="ImportBackup text-warning"
        onClick={() => {
          // setOpen(false);
        }}
      >
        <LucideIcon icon={<HardDriveUploadIcon />} />
        <div>Import Backup</div>
      </FloatingMenuButton>

      <FloatingMenuButton
        className="Update"
        onClick={async () => {
          // setOpen(false);
          await hardPWAReload();
        }}
      >
        <LucideIcon icon={<CircleArrowUpIcon />} />
        <div>Update</div>
      </FloatingMenuButton>

      <FloatingMenuButton
        className="Help"
        onClick={() => {
          // setOpen(false);
          toast(`${__APP_VERSION__}`, { containerId: "toaster" });
        }}
      >
        <LucideIcon icon={<CircleQuestionMarkIcon />} />
        <div>Help</div>
      </FloatingMenuButton>
      <hr className="m-1 border-gray-300" />

      <FloatingMenuButton
        className="Exit text-error!"
        onClick={() => {
          // setOpen(false);
          if (confirm("All data on this device will be wiped. Are you sure?")) {
            logout();
          }
        }}
      >
        <LucideIcon icon={<LogInIcon className="text-error" />} />
        <div>Exit</div>
      </FloatingMenuButton>
    </FloatingMenu>
  );
}

import log from "loglevel";
import {
  BoltIcon,
  CircleArrowUpIcon,
  CircleQuestionMarkIcon,
  HardDriveDownloadIcon,
  HardDriveUploadIcon,
  LockKeyholeIcon,
  LogInIcon,
  UserRoundIcon,
} from "lucide-react";
import { useRef } from "react";
import { toast } from "react-toastify";
import { copyToClipboard, hardPWAReload, lockScreen, logout } from "../../api/api";
import useZustandStore from "../../store/useZustandStore";
import { downloadExport } from "../../utils/exportImport";
import FloatingMenu from "../Common/FloatingMenu";
import FloatingMenuButton from "../Common/FloatingMenuButton";
import LucideIcon from "../Common/LucideIcon";
import ZipUploadInput from "./UploadBackup";

declare const __APP_VERSION__: string;

export default function MainMenu() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      {/* Should be always persistent in DOM */}
      <ZipUploadInput ref={fileInputRef} />
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
          className="Settings "
          onClick={() => {
            log.debug("isSettingsOpened", true);
            useZustandStore.setState({ isSettingsOpened: true });
            // setOpen(false);
          }}
        >
          <LucideIcon icon={<BoltIcon className="" />} />
          <div>Settings</div>
        </FloatingMenuButton>
        <FloatingMenuButton
          className="DownloadBackup "
          onClick={async () => {
            downloadExport();
            // setOpen(false);
          }}
        >
          <LucideIcon icon={<HardDriveDownloadIcon className="" />} />
          <div>Download Backup</div>
        </FloatingMenuButton>

        <FloatingMenuButton
          className="ImportBackup "
          onClick={() => {
            if (fileInputRef.current) {
              fileInputRef.current.value = "";
              fileInputRef.current.click();
            }
          }}
        >
          <LucideIcon icon={<HardDriveUploadIcon className="" />} />
          <div>Import Backup</div>
        </FloatingMenuButton>

        <FloatingMenuButton
          className="LockScreen"
          onClick={() => {
            lockScreen();
          }}
        >
          <LucideIcon icon={<LockKeyholeIcon className="" />} />
          <div>Lock Screen</div>
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
          <LucideIcon icon={<LogInIcon className="text-error!" />} />
          <div>Exit</div>
        </FloatingMenuButton>
      </FloatingMenu>
    </>
  );
}

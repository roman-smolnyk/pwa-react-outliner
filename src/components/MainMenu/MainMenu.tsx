import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useConfirm } from "@/hooks/useConfirm";
import log from "loglevel";
import {
  BoltIcon,
  CircleArrowUpIcon,
  CircleQuestionMarkIcon,
  CloudAlertIcon,
  CloudCheckIcon,
  HardDriveDownloadIcon,
  HardDriveUploadIcon,
  LockKeyholeIcon,
  LogOutIcon,
  MenuIcon,
  MoonIcon,
  RefreshCwIcon,
  RotateCwIcon,
  SunIcon,
  SunMoonIcon,
  UserRoundIcon,
} from "lucide-react";
import { useRef } from "react";
import { toast } from "sonner";
import { copyToClipboard, hardPWAReload, lockScreen, logout } from "../../api/api";
import { useTheme } from "../../hooks/useTheme";
import useZustandStore from "../../store/useZustandStore";
import { downloadExport } from "../../utils/exportImport";
import ZipUploadInput from "./UploadBackup";

declare const __APP_VERSION__: string;

export default function MainMenu() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const webSocketConnectionStatus = useZustandStore((s) => s.webSocketConnectionStatus);

  const { theme, setTheme } = useTheme();
  const [confirm, ConfirmationDialog] = useConfirm();

  return (
    <>
      {/* Should be always persistent in DOM */}
      <ZipUploadInput ref={fileInputRef} />
      <ConfirmationDialog />

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="bare" size="tool">
              <MenuIcon />
            </Button>
          }
        />
        <DropdownMenuContent className="w-max" align="end">
          <DropdownMenuGroup>
            {/* <DropdownMenuLabel>Main Menu</DropdownMenuLabel> */}

            <div className="p-1 flex justify-between gap-4">
              <Button
                variant="outline"
                title={`WebSocket status: ${webSocketConnectionStatus}`}
                onClick={() => {
                  toast.info(`WebSocket status: '${webSocketConnectionStatus}'`);
                }}
              >
                {/* {webSocketConnectionStatus === "connecting" && <LucideIcon icon={<CloudAlertIcon />} />} */}
                {webSocketConnectionStatus === "connecting" && <RefreshCwIcon className="animate-spin" />}
                {webSocketConnectionStatus === "connected" && <CloudCheckIcon />}
                {/* {webSocketConnectionStatus === "disconnected" && <LucideIcon className="animate-spin" icon={<RefreshCwIcon />} />} */}
                {webSocketConnectionStatus === "disconnected" && <CloudAlertIcon />}
                {/* {webSocketConnectionStatus === "turned off" && <LucideIcon icon={<CloudCogIcon />} />} */}
              </Button>
              <ToggleGroup
                variant="outline"
                value={[theme as string]}
                spacing={0}
                onValueChange={(values) => {
                  const value = values[0] as any;
                  if (value) setTheme(value);
                }}
              >
                <ToggleGroupItem value="system" aria-label="System" title="System">
                  <SunMoonIcon />
                </ToggleGroupItem>
                <ToggleGroupItem value="light" aria-label="Light" title="Light">
                  <SunIcon />
                </ToggleGroupItem>
                <ToggleGroupItem value="dark" aria-label="Darke" title="Dark">
                  <MoonIcon />
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={async () => {
                await copyToClipboard(useZustandStore.getState().roomToken as string);
                // toast("Copied", { containerId: "toaster" });
              }}
            >
              <UserRoundIcon />
              <span>Copy Token</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => {
                log.debug("isSettingsOpened", true);
                useZustandStore.setState({ isSettingsOpened: true });
              }}
            >
              <BoltIcon />
              <span>Settings</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={async () => {
                downloadExport();
              }}
            >
              <HardDriveDownloadIcon />
              <span>Download Backup</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                  fileInputRef.current.click();
                }
              }}
            >
              <HardDriveUploadIcon />
              <span>Import Backup</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => {
                lockScreen();
              }}
            >
              <LockKeyholeIcon />
              <span>Lock Screen</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={async () => {
                await hardPWAReload();
              }}
            >
              <CircleArrowUpIcon />
              <span>Update</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => {
                toast.info(`${__APP_VERSION__}`);
              }}
            >
              <CircleQuestionMarkIcon />
              <span>Help</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={(e) => {
                e.currentTarget.classList.add("animate-spin");
                window.location.replace(window.location.href);
              }}
            >
              <RotateCwIcon />
              <span>Refresh</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={async () => {
                const isConfirmed = await confirm({
                  title: "Logout?",
                  description: "All data on this device will be wiped. Are you sure?",
                });

                if (isConfirmed) {
                  logout();
                }
              }}
            >
              <LogOutIcon />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

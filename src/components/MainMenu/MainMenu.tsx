import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Kbd } from "@/components/ui/kbd";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
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
} from "lucide-react";
import { useRef } from "react";
import { toast } from "sonner";
import { hardPWAReload, lockScreen, logout, reload } from "../../api/api";
import { useTheme } from "../../hooks/useTheme";
import useStore from "../../store/useStore";
import { downloadExport } from "../../utils/exportImport";
import ZipUploadInput from "./UploadBackup";

declare const __APP_VERSION__: string;

export default function MainMenu() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const webSocketConnectionStatus = useStore((s) => s.webSocketConnectionStatus);
  const username = useStore((s) => s.username);

  log.debug("MainMenu:username", username, webSocketConnectionStatus);

  const { theme, setTheme } = useTheme();
  const [confirm, ConfirmationDialog] = useConfirm();

  return (
    <>
      {/* Should be always persistent in DOM */}
      <ZipUploadInput ref={fileInputRef} />
      <ConfirmationDialog />

      <DropdownMenu modal={true}>
        <DropdownMenuTrigger
          render={
            <Button variant="bare" size="tool" className="MainMenu">
              <MenuIcon />
            </Button>
          }
        />
        <DropdownMenuContent className="w-max" align="end" sideOffset={2}>
          <DropdownMenuGroup>
            {/* <DropdownMenuLabel>Main Menu</DropdownMenuLabel> */}

            <DropdownMenuLabel className="max-w-40 flex items-center gap-2">
              <Avatar size="sm">
                <AvatarFallback>{username.length >= 2 ? username.slice(0, 2).toUpperCase() : "AA"}</AvatarFallback>
              </Avatar>
              {/* text-muted-foreground */}
              <span className="text-sm truncate">{username}</span>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <div className="p-1 flex justify-between gap-4">
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      variant="outline"
                      onClick={() => {
                        toast.info(`Web Socket "${webSocketConnectionStatus}"`);
                      }}
                    >
                      {/* {webSocketConnectionStatus === "connecting" && <CloudAlertIcon /> */}
                      {webSocketConnectionStatus === "connecting" && <RefreshCwIcon className="animate-spin" />}
                      {webSocketConnectionStatus === "connected" && <CloudCheckIcon />}
                      {webSocketConnectionStatus === "disconnected" && <CloudAlertIcon />}
                      {/* {webSocketConnectionStatus === "turned off" && <CloudCogIcon /> */}
                    </Button>
                  }
                />
                <TooltipContent side="left">
                  Web Socket <Kbd>{webSocketConnectionStatus}</Kbd>
                </TooltipContent>
              </Tooltip>

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

            {/* <DropdownMenuItem
              onClick={async () => {
                await copyToClipboard(useStore.getState().roomToken as string);
                // toast("Copied", { containerId: "toaster" });
              }}
            >
              <UserRoundIcon />
              <span>Copy Token</span>
            </DropdownMenuItem> */}

            <DropdownMenuItem
              onClick={() => {
                log.debug("isSettingsOpen", true);
                useStore.setState({ isSettingsOpen: true });
              }}
            >
              <BoltIcon />
              <span>Settings</span>
            </DropdownMenuItem>

            {/* // TODO: Move to Settings */}
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
                reload();
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

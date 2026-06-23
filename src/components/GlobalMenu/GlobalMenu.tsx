import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useConfirm } from "@/hooks/useConfirm";
import useIsMobile from "@/hooks/useIsMobile";
import useUpdateVersion from "@/hooks/useUpdateVersion";
import log from "loglevel";
import {
  BoltIcon,
  ChevronsUpDownIcon,
  CircleArrowUpIcon,
  CircleQuestionMarkIcon,
  LockKeyholeIcon,
  LogOutIcon,
  MoonIcon,
  RotateCwIcon,
  SunIcon,
  SunMoonIcon,
} from "lucide-react";
import React from "react";
import { toast } from "sonner";
import { hardPWAReload, lockScreen, logout, reload } from "../../api/api";
import { useTheme, type Themes } from "../../hooks/useTheme";
import useStore from "../../store/useStore";

declare const __APP_VERSION__: string;

function Mobile({
  Trigger,
  theme,
  setTheme,
  confirm,
  version,
}: {
  Trigger: React.ComponentType<any>;
  theme: Themes | undefined;
  setTheme: (theme: Themes) => void;
  confirm: (title: string, description: string) => Promise<boolean> | boolean;
  version: string;
}) {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Trigger />
      </DrawerTrigger>
      <DrawerContent>
        {/* Accessibility header */}
        <DrawerHeader className="hidden">
          <DrawerTitle>Menu</DrawerTitle>
        </DrawerHeader>

        <div className="Mobile p-2 flex flex-col gap-2">
          <div className="my-5 flex justify-center">
            <ToggleGroup
              variant="outline"
              size="xl"
              spacing={0}
              value={[theme as string]}
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
              <ToggleGroupItem value="dark" aria-label="Dark" title="Dark">
                <MoonIcon />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          <DrawerClose asChild>
            <Button
              variant="menuitem"
              size="lg"
              onClick={() => {
                log.debug("isSettingsOpen", true);
                useStore.setState({ isSettingsOpen: true });
              }}
            >
              <BoltIcon />
              <span>Settings</span>
            </Button>
          </DrawerClose>

          <Button
            variant="menuitem"
            size="lg"
            onClick={() => {
              lockScreen();
            }}
          >
            <LockKeyholeIcon />
            <span>Lock Screen</span>
          </Button>

          <Button
            variant="menuitem"
            size="lg"
            onClick={(e) => {
              e.currentTarget.classList.add("animate-spin");
              reload();
            }}
          >
            <RotateCwIcon />
            <span>Refresh</span>
          </Button>

          <Button
            variant="menuitem"
            size="lg"
            onClick={() => {
              toast.info(`${__APP_VERSION__}`);
            }}
          >
            <CircleQuestionMarkIcon />
            <span>Help</span>
          </Button>

          <Separator />

          <Button
            variant="menuitem"
            size="lg"
            onClick={async () => {
              await hardPWAReload();
            }}
          >
            <CircleArrowUpIcon />
            <span>Update {version ? (version !== __APP_VERSION__ ? `(${version})` : "") : ""}</span>
          </Button>

          <Button
            variant="menuitem"
            size="lg"
            className="text-destructive justify-start"
            onClick={async () => {
              if (await confirm("Logout?", "All data on this device will be wiped. Are you sure?")) {
                logout();
              }
            }}
          >
            <LogOutIcon />
            <span>Logout</span>
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function Desktop({
  Trigger,
  theme,
  setTheme,
  confirm,
  version,
}: {
  Trigger: React.ComponentType<any>;
  theme: Themes | undefined;
  setTheme: (theme: Themes) => void;
  confirm: (title: string, description: string) => Promise<boolean> | boolean;
  version: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Trigger />} />
      <DropdownMenuContent className="Desktop">
        <DropdownMenuGroup>
          {/* <DropdownMenuLabel>Main Menu</DropdownMenuLabel> */}

          <div className="p-1 flex justify-center gap-4">
            <ToggleGroup
              variant="outline"
              size="lg"
              spacing={0}
              value={[theme as string]}
              onValueChange={(values) => {
                const value = values[0] as any;
                if (value) setTheme(value);
              }}
            >
              <Tooltip>
                <TooltipTrigger
                  render={
                    <ToggleGroupItem value="system" aria-label="System" title="System">
                      <SunMoonIcon />
                    </ToggleGroupItem>
                  }
                />
                <TooltipContent side="top">Web Socket</TooltipContent>
              </Tooltip>

              <ToggleGroupItem value="light" aria-label="Light" title="Light">
                <SunIcon />
              </ToggleGroupItem>
              <ToggleGroupItem value="dark" aria-label="Dark" title="Dark">
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

          <DropdownMenuItem
            onClick={() => {
              lockScreen();
            }}
          >
            <LockKeyholeIcon />
            <span>Lock Screen</span>
            <DropdownMenuShortcut>⌘+L</DropdownMenuShortcut>
          </DropdownMenuItem>

          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={(e) => {
                e.currentTarget.classList.add("animate-spin");
                reload();
              }}
            >
              <RotateCwIcon />
              <span>Refresh</span>
              <DropdownMenuShortcut>⌘+R</DropdownMenuShortcut>
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

          <DropdownMenuItem
            onClick={async () => {
              await hardPWAReload();
            }}
          >
            <CircleArrowUpIcon />
            <span>Update {version ? (version !== __APP_VERSION__ ? `(${version})` : "") : ""}</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            variant="destructive"
            onClick={async () => {
              if (await confirm("Logout?", "All data on this device will be wiped. Are you sure?")) {
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
  );
}

export default function GlobalMenu() {
  const username = useStore((s) => s.username);

  const isMobile = useIsMobile();
  const { theme, setTheme } = useTheme();

  const confirm = useConfirm();

  const version = useUpdateVersion();

  const Trigger = ({ ...props }) => (
    <Button variant="outline" size="lg" className="py-7 w-full " {...props}>
      <Avatar>
        <AvatarFallback>{username.length >= 2 ? username.slice(0, 2).toUpperCase() : "AA"}</AvatarFallback>
      </Avatar>
      <div className="flex-1 text-left text-sm leading-tight flex flex-col ">
        <span className="truncate font-medium">{username}</span>
        <span className="truncate text-xs text-muted-foreground">Account</span>
      </div>
      <ChevronsUpDownIcon className="ml-auto" />
    </Button>
  );

  return isMobile ? (
    <Mobile Trigger={Trigger} theme={theme} setTheme={setTheme} confirm={confirm} version={version} />
  ) : (
    <Desktop Trigger={Trigger} theme={theme} setTheme={setTheme} confirm={confirm} version={version} />
  );
}

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useConfirm } from "@/contexts/ConfirmationContext";
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
import { handleLogout, handlePWAUpdate, handleReload, lockScreen } from "../../api/api";
import { useTheme } from "../../contexts/ThemeContext";
import useStore from "../../store/useStore";
import { AdaptiveMenu, AdaptiveMenuItem, AdaptiveMenuItemShortcut, AdaptiveMenuSeparator } from "../Common/AdaptiveMenu/AdaptiveMenu";

declare const __APP_VERSION__: string;

export default function GlobalMenu() {
  const username = useStore((s) => s.username);

  const { theme, setTheme } = useTheme();

  const confirm = useConfirm();

  const version = useUpdateVersion();

  const Trigger = ({ ...props }) => (
    <Button variant="outline" size="lg" className="py-7 w-full" {...props}>
      <Avatar>
        <AvatarFallback>{username.length >= 2 ? username.slice(0, 2).toUpperCase() : "AA"}</AvatarFallback>
      </Avatar>
      <div className="flex-1 text-left text-sm leading-tight flex flex-col">
        <span className="truncate font-medium">{username}</span>
        <span className="truncate text-xs text-muted-foreground">Account</span>
      </div>
      <ChevronsUpDownIcon className="ml-auto" />
    </Button>
  );

  return (
    <AdaptiveMenu Trigger={Trigger}>
      <div className="py-5 sm:py-1 flex justify-center">
        <ToggleGroup
          variant="outline"
          size="adaptive"
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
                <ToggleGroupItem value="system" aria-label="System">
                  <SunMoonIcon />
                </ToggleGroupItem>
              }
            />
            <TooltipContent side="top">System</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              render={
                <ToggleGroupItem value="light" aria-label="Light">
                  <SunIcon />
                </ToggleGroupItem>
              }
            />
            <TooltipContent side="top">Light</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              render={
                <ToggleGroupItem value="dark" aria-label="Dark">
                  <MoonIcon />
                </ToggleGroupItem>
              }
            />
            <TooltipContent side="top">Dark</TooltipContent>
          </Tooltip>
        </ToggleGroup>
      </div>

      <AdaptiveMenuSeparator />

      <AdaptiveMenuItem
        onClick={() => {
          log.debug("isSettingsOpen", true);
          useStore.setState({ isSettingsOpen: true });
        }}
      >
        <BoltIcon />
        <span>Settings</span>
      </AdaptiveMenuItem>

      <AdaptiveMenuItem onClick={() => lockScreen()}>
        <LockKeyholeIcon />
        <span>Lock Screen</span>
        <AdaptiveMenuItemShortcut>⌘+L</AdaptiveMenuItemShortcut>
      </AdaptiveMenuItem>

      <AdaptiveMenuItem
        onClick={(e) => {
          e.currentTarget.firstChild?.classList.add("animate-spin");
          handleReload();
        }}
      >
        <RotateCwIcon />
        <span>Refresh</span>
        <AdaptiveMenuItemShortcut>⌘+R</AdaptiveMenuItemShortcut>
      </AdaptiveMenuItem>

      <AdaptiveMenuItem onClick={() => toast.info(`${__APP_VERSION__}`)}>
        <CircleQuestionMarkIcon />
        <span>Help</span>
      </AdaptiveMenuItem>

      <AdaptiveMenuSeparator />

      <AdaptiveMenuItem onClick={async () => await handlePWAUpdate()}>
        <CircleArrowUpIcon />
        <span>Update {version ? (version !== __APP_VERSION__ ? `(${version})` : "") : ""}</span>
      </AdaptiveMenuItem>

      <AdaptiveMenuItem
        destructive
        onClick={async () => {
          if (await confirm("Logout?", "All data on this device will be wiped. Are you sure?")) {
            handleLogout();
          }
        }}
      >
        <LogOutIcon />
        <span>Logout</span>
      </AdaptiveMenuItem>

      <AdaptiveMenuItem className="opacity-60 pointer-events-none" onClick={() => {}}>
        <span className="text-xs">{`v${__APP_VERSION__}`}</span>
      </AdaptiveMenuItem>
    </AdaptiveMenu>
  );
}

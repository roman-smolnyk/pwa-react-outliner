import { copyToClipboard, debouncedSetWebSocketServer, handleUsernameUpdate, refreshToken, setWebSocketServer } from "@/api/api";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useConfirm } from "@/hooks/useConfirm";
import { THEMES, useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import localPreferencesManager from "@/store/preferences";
import useStore from "@/store/useStore";
import { downloadExport } from "@/utils/exportImport";
import { ChevronLeftIcon, EyeIcon, EyeOffIcon, HardDriveDownloadIcon, HardDriveUploadIcon, PencilIcon } from "lucide-react";
import { forwardRef, useEffect, useRef, useState, type InputHTMLAttributes } from "react";
import { useShallow } from "zustand/react/shallow";
import { WS_SERVER_URL } from "../../../config";
import ResponsiveModal from "../Common/ResponsiveModal";
import ZipUploadInput from "./ZipUploadInput";

const autoLockOptions = [
  { label: "Never", value: -1 },
  { label: "1 min", value: 60000 },
  { label: "5 min", value: 300000 },
  { label: "10 min", value: 600000 },
  { label: "30 min", value: 1800000 },
  { label: "1 hour", value: 3600000 },
];

const PasswordInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative rounded-md shadow-sm w-full">
      <Input type={showPassword ? "text" : "password"} className={cn("pr-10", className)} ref={ref} {...props} />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute right-0 top-0 h-full px-3 py-2"
        onClick={() => setShowPassword((prev) => !prev)}
      >
        {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
        <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
      </Button>
    </div>
  );
});
PasswordInput.displayName = "PasswordInput";

function SettingsSection({ title, defaultOpen = true, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  return (
    <Collapsible defaultOpen={defaultOpen}>
      <CollapsibleTrigger
        render={
          <Button variant="ghost" size="lg" className="w-full bg-muted">
            <span className="text-base font-semibold tracking-wide">{title}</span>
            <ChevronLeftIcon className="ml-auto group-data-panel-open/button:-rotate-90" />
          </Button>
        }
      />
      <CollapsibleContent className="py-4 pl-4 pr-2 flex flex-col gap-4">{children}</CollapsibleContent>
    </Collapsible>
  );
}

export default function Settings() {
  const usernameRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [lockScreenPin, setLockScreenPin] = useState("");
  const [isPinFocused, setIsPinFocused] = useState(false);
  const [isUsernameEdit, setIsUsernameEdit] = useState(false);

  const isSettingsOpen = useStore((s) => s.isSettingsOpen);

  const { roomToken, username, isWebSocketServerOn, webSocketServerUrl, autoLockTimeout } = useStore(
    useShallow((s) => ({
      roomToken: s.roomToken,
      username: s.username,
      isWebSocketServerOn: s.isWebSocketServerOn,
      webSocketServerUrl: s.webSocketServerUrl,
      autoLockTimeout: s.autoLockTimeout,
    })),
  );

  const { theme, setTheme } = useTheme();

  const confirm = useConfirm();

  useEffect(() => {
    setTimeout(async () => {
      const savedPin = await localPreferencesManager.get("lockScreenPin");
      if (savedPin) setLockScreenPin(savedPin);
    });
  }, []);

  return (
    <>
      {/* Should be always persistent in DOM */}
      <ZipUploadInput ref={fileInputRef} />
      <ResponsiveModal
        title="Settings"
        open={isSettingsOpen}
        onOpenChange={(open: boolean) => {
          useStore.setState({ isSettingsOpen: open });
        }}
      >
        <div className="Settings flex-1 pr-4 pb-7 overflow-x-hidden overflow-y-auto overscroll-contain flex flex-col gap-3">
          <SettingsSection title="Account">
            <div className="flex items-center gap-2">
              <Avatar size="lg" className="">
                <AvatarFallback>{username.length >= 2 ? username.slice(0, 2).toUpperCase() : "AA"}</AvatarFallback>
              </Avatar>
              {isUsernameEdit ? (
                <Input
                  id="username"
                  className="max-w-3xs font-semibold"
                  ref={usernameRef}
                  value={username}
                  onChange={(e) => {
                    handleUsernameUpdate(e.target.value);
                  }}
                  onBlur={() => {
                    setIsUsernameEdit(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setIsUsernameEdit(false);
                    }
                  }}
                />
              ) : (
                <div className="ml-2 font-semibold">{username}</div>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setIsUsernameEdit(true);
                  requestAnimationFrame(() => {
                    usernameRef.current?.focus();
                  });
                }}
                aria-label="Edit username"
              >
                <PencilIcon />
              </Button>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="token" className="text-muted-foreground">
                Access Token
              </Label>
              <div className="flex items-center gap-2">
                <PasswordInput id="token" className="text-xs" value={roomToken} disabled />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    await copyToClipboard(useStore.getState().roomToken as string);
                  }}
                >
                  Copy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    const isConfirmed = await confirm(
                      "Refresh account token?",
                      "You will need to log in again on your other devices. App will be reloaded.",
                    );
                    if (isConfirmed) {
                      refreshToken();
                    }
                  }}
                >
                  Refresh
                </Button>
              </div>
            </div>
          </SettingsSection>

          <SettingsSection title="Appearance">
            <div className="flex flex-col gap-2">
              <Label htmlFor="theme-select" className="text-muted-foreground">
                Theme
              </Label>
              <Select
                value={theme}
                items={THEMES}
                onValueChange={(value) => {
                  if (value) setTheme(value);
                }}
              >
                <SelectTrigger id="theme-select" className="w-full max-w-xs">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Themes</SelectLabel>
                    {THEMES.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </SettingsSection>

          <SettingsSection title="Synchronization">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="synchronization" className="text-base cursor-pointer">
                  Enable Sync
                </Label>
                <div className="text-sm text-muted-foreground">Synchronize data between devices</div>
              </div>
              <Switch
                className="cursor-pointer"
                id="synchronization"
                checked={isWebSocketServerOn}
                onCheckedChange={(checked) => setWebSocketServer({ isWebSocketServerOn: checked })}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="ws-url" className="text-muted-foreground">
                Web Socket URL
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="ws-url"
                  value={webSocketServerUrl}
                  onChange={(e) => {
                    useStore.setState({ webSocketServerUrl: e.target.value });
                    debouncedSetWebSocketServer({ webSocketServerUrl: e.target.value });
                  }}
                />
                <Button variant="outline" size="sm" onClick={() => setWebSocketServer({ webSocketServerUrl: WS_SERVER_URL })}>
                  Reset
                </Button>
              </div>
            </div>
          </SettingsSection>

          <SettingsSection title="Lock Screen">
            <div className="flex flex-col gap-2">
              <Label htmlFor="lock-screen-pin" className="text-muted-foreground">
                PIN
              </Label>
              <Input
                id="lock-screen-pin"
                className="max-w-xs tracking-widest"
                value={lockScreenPin}
                onChange={async (e) => {
                  const value = e.target.value.replace(/[^0-9]/g, "");
                  setLockScreenPin(value);
                  await localPreferencesManager.set("lockScreenPin", value);
                }}
                type={isPinFocused ? "text" : "password"}
                onFocus={() => setIsPinFocused(true)}
                onBlur={() => setIsPinFocused(false)}
                maxLength={6}
                // placeholder=""
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="auto-lock-timeout" className="text-muted-foreground">
                Auto-Lock Timeout
              </Label>
              <Select
                value={autoLockTimeout}
                items={autoLockOptions}
                onValueChange={async (value) => {
                  if (value === null) return;
                  useStore.setState({ autoLockTimeout: value });
                  await localPreferencesManager.set("autoLockTimeout", value);
                }}
              >
                <SelectTrigger id="auto-lock-timeout" className="w-full max-w-xs">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Duration</SelectLabel>
                    {autoLockOptions.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </SettingsSection>

          <SettingsSection title="Data">
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                onClick={async () => {
                  downloadExport();
                }}
              >
                <HardDriveDownloadIcon />
                <span>Download Backup</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                    fileInputRef.current.click();
                  }
                }}
              >
                <HardDriveUploadIcon />
                <span>Import Backup</span>
              </Button>
            </div>
          </SettingsSection>
        </div>
      </ResponsiveModal>
    </>
  );
}

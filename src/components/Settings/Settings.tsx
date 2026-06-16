import { copyToClipboard, debouncedSetWebSocketServer, handleUsernameUpdate, refreshToken, setWebSocketServer } from "@/api/api";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemTitle } from "@/components/ui/item";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useConfirm } from "@/hooks/useConfirm";
import { THEMES, useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import localPreferencesManager from "@/store/preferences";
import useStore from "@/store/useStore";
import { EyeIcon, EyeOffIcon, PencilIcon } from "lucide-react";
import { forwardRef, useEffect, useRef, useState, type InputHTMLAttributes } from "react";
import { useShallow } from "zustand/react/shallow";
import { WS_SERVER_URL } from "../../../config";
import ResponsiveModal from "../Common/ResponsiveModal";

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
        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
        <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
      </Button>
    </div>
  );
});

const SectionTitle = ({ children }: { children: React.ReactNode }) => <h5 className="text-muted-foreground">{children}</h5>;

export default function Settings() {
  const usernameRef = useRef<HTMLInputElement>(null);
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
    <ResponsiveModal
      title="Settings"
      open={isSettingsOpen}
      onOpenChange={(open: boolean) => {
        useStore.setState({ isSettingsOpen: open });
      }}
    >
      <div className="Settings pr-4 pb-7 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain flex flex-col gap-4">
        <ItemGroup>
          <SectionTitle>Account</SectionTitle>
          <Separator />

          <div className="flex flex-col gap-4">
            {/* <Label htmlFor="username">Username</Label> */}
            <div className="flex items-center">
              <Avatar className="mr-4">
                <AvatarFallback>{username.length >= 2 ? username.slice(0, 2).toUpperCase() : "AA"}</AvatarFallback>
              </Avatar>
              {isUsernameEdit ? (
                <Input
                  id="username"
                  className="max-w-3xs"
                  ref={usernameRef}
                  value={username}
                  onChange={(e) => {
                    handleUsernameUpdate(e.target.value);
                  }}
                  onBlur={() => {
                    setIsUsernameEdit(false);
                  }}
                />
              ) : (
                <h4>{username}</h4>
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
              >
                <PencilIcon />
              </Button>
            </div>
          </div>

          <div className="mb-4 flex flex-col gap-4">
            <Label htmlFor="token">Access Token</Label>
            <div className="flex justify-between gap-4">
              <PasswordInput id="token" value={roomToken} disabled />
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={async () => {
                    await copyToClipboard(useStore.getState().roomToken as string);
                  }}
                >
                  Copy
                </Button>
                <Button
                  variant="secondary"
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
          </div>
        </ItemGroup>

        <ItemGroup>
          <SectionTitle>Appearance</SectionTitle>
          <Separator />
          <Item className="p-0">
            <ItemContent>
              <ItemTitle>Theme</ItemTitle>
            </ItemContent>
            <ItemActions>
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
            </ItemActions>
          </Item>
        </ItemGroup>

        <ItemGroup>
          <SectionTitle>Synchronization</SectionTitle>
          <Separator />
          <Item className="p-0">
            <ItemContent>
              <ItemTitle>Enable Sync</ItemTitle>
              <ItemDescription>Synchronize data between devices</ItemDescription>
            </ItemContent>
            <ItemActions>
              <Switch
                id="synchronization"
                checked={isWebSocketServerOn}
                onCheckedChange={(checked) => setWebSocketServer({ isWebSocketServerOn: checked })}
              />
            </ItemActions>
          </Item>

          <div className="mb-4 flex flex-col gap-4">
            <Label htmlFor="ws-url">Web Socket URL</Label>
            <div className="flex justify-between gap-4">
              <Input
                id="ws-url"
                value={webSocketServerUrl}
                onChange={(e) => {
                  useStore.setState({ webSocketServerUrl: e.target.value });
                  debouncedSetWebSocketServer({ webSocketServerUrl: e.target.value });
                }}
              />
              <Button variant="secondary" onClick={() => setWebSocketServer({ webSocketServerUrl: WS_SERVER_URL })}>
                Reset
              </Button>
            </div>
          </div>
        </ItemGroup>

        <ItemGroup>
          <SectionTitle>Lock Screen</SectionTitle>
          <Separator />
          <div className="flex flex-col gap-4">
            <Label htmlFor="lock-screen-pin">PIN</Label>
            <Input
              id="lock-screen-pin"
              className="max-w-xs"
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

          <div className="flex flex-col gap-4">
            <Label htmlFor="lock-screen-timeout">Auto-Lock Duration</Label>
            <Select
              value={autoLockTimeout}
              items={autoLockOptions}
              onValueChange={async (value) => {
                if (value === null) return;
                console.debug(typeof value);
                useStore.setState({ autoLockTimeout: value });
                await localPreferencesManager.set("autoLockTimeout", value);
              }}
            >
              <SelectTrigger id="lock-screen-timeout" className="w-full max-w-xs">
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
        </ItemGroup>
      </div>
    </ResponsiveModal>
  );
}

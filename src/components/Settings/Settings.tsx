import { debouncedSetWebSocketServer, setWebSocketServer } from "@/api/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemTitle } from "@/components/ui/item";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { THEMES, useTheme } from "@/hooks/useTheme";
import localPreferencesManager from "@/store/preferences";
import useStore from "@/store/useStore";
import { useEffect, useState, type ReactNode } from "react";
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

export default function Settings() {
  const [lockScreenPin, setLockScreenPin] = useState("");
  const [isPinFocused, setIsPinFocused] = useState(false);

  const isSettingsOpen = useStore((s) => s.isSettingsOpen);
  const isWebSocketServerOn = useStore((s) => s.isWebSocketServerOn);
  const webSocketServerUrl = useStore((s) => s.webSocketServerUrl);
  const autoLockScreen = useStore((s) => s.autoLockTimeout);

  const { theme, setTheme } = useTheme();

  // Load the initial pin preference
  useEffect(() => {
    setTimeout(async () => {
      const savedPin = await localPreferencesManager.get("lockScreenPin");
      if (savedPin) setLockScreenPin(savedPin);
    });
  }, []);

  const handleOpenChange = (open: boolean) => {
    useStore.setState({ isSettingsOpen: open });
  };

  const SectionTitle = ({ children }: { children: ReactNode }) => <h5 className="text-muted-foreground">{children}</h5>;

  return (
    <ResponsiveModal title="Settings" open={isSettingsOpen} onOpenChange={handleOpenChange}>
      <div className="Settings flex-1 overflow-y-auto overscroll-contain pr-4 flex flex-col gap-4">
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
              placeholder="••••"
            />
          </div>

          <div className="flex flex-col gap-4">
            <Label htmlFor="lock-screen-timeout">Auto-Lock Duration</Label>
            <Select
              value={autoLockScreen}
              items={autoLockOptions}
              onValueChange={async (value) => {
                if (value === null) return;
                console.debug(typeof value);
                useStore.setState({ autoLockTimeout: value });
                await localPreferencesManager.set("autoLockScreen", value);
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

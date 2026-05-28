import { XIcon } from "lucide-react";
import { WS_SERVER_URL } from "../../../config";
import { debouncedSetWebSocketServer, setWebSocketServer } from "../../api/api";
import useZustandStore from "../../store/useZustandStore";
import { FloatingWindow } from "../Common/FloatingWindow";
import IconedButton from "../Common/IconedButton";
import Input from "../Common/Input";
import LucideIcon from "../Common/LucideIcon";
import SecondaryButton from "../Common/SecondaryButton";
import ToggleSlider from "../Common/ToggleSlider";

export function Settings() {
  const isSettingsOpened = useZustandStore((s) => s.isSettingsOpened);
  const isWebSocketServerOn = useZustandStore((s) => s.isWebSocketServerOn);
  const webSocketServerUrl = useZustandStore((s) => s.webSocketServerUrl);

  // log.debug("Settings:isWebSocketServerOn", isWebSocketServerOn);

  return (
    <FloatingWindow isOpen={isSettingsOpened} setIsOpen={() => useZustandStore.setState({ isSettingsOpened: false })}>
      {/* Header */}
      <div className="p-3 border-b border-border flex items-center justify-between">
        <div>
          <h3>Settings</h3>
        </div>
        <IconedButton onClick={() => useZustandStore.setState({ isSettingsOpened: false })}>
          <LucideIcon icon={<XIcon />} />
        </IconedButton>
      </div>

      <div className="px-3 pb-3 pt-5">
        <div className="flex flex-col gap-3">
          <h5>Synchronisation</h5>
          <hr className="m-0" />
          <div className="flex items-center gap-3">
            <ToggleSlider checked={isWebSocketServerOn} onChange={(checked) => setWebSocketServer({ isWebSocketServerOn: checked })} />
            <p>Sync</p>
          </div>
          <div className="flex flex-col gap-3">
            <p>Web Socket url</p>
            <div className="flex gap-3">
              <Input
                value={webSocketServerUrl}
                onChange={(e) => {
                  useZustandStore.setState({ webSocketServerUrl: e.target.value });
                  debouncedSetWebSocketServer({ webSocketServerUrl: e.target.value });
                }}
              />
              <SecondaryButton onClick={() => setWebSocketServer({ webSocketServerUrl: WS_SERVER_URL })}>Reset</SecondaryButton>
            </div>
          </div>
        </div>
      </div>
    </FloatingWindow>
  );
}

import {
  FloatingFocusManager,
  FloatingOverlay,
  FloatingPortal,
  useClick,
  useDismiss,
  useFloating,
  useId,
  useInteractions,
  useRole,
} from "@floating-ui/react";
import { XIcon } from "lucide-react";
import useZustandStore from "../../store/useZustandStore";
import IconedButton from "../Common/IconedButton";
import Input from "../Common/Input";
import LucideIcon from "../Common/LucideIcon";
import SecondaryButton from "../Common/SecondaryButton";
import ToggleSlider from "../Common/ToggleSlider";
import { WS_SERVER_URL } from "../../../config";
import { debouncedSetWebSocketServer, setWebSocketServer } from "../../api/api";
import log from "loglevel";

export function Settings() {
  //   const [isOpen, setIsOpen] = useState(false);

  const isSettingsOpened = useZustandStore((s) => s.isSettingsOpened);
  const isWebSocketServerOn = useZustandStore((s) => s.isWebSocketServerOn);
  const webSocketServerUrl = useZustandStore((s) => s.webSocketServerUrl);

  // log.debug("Settings:isWebSocketServerOn", isWebSocketServerOn);

  const { refs, context } = useFloating({
    open: isSettingsOpened,
    onOpenChange: () => useZustandStore.setState({ isSettingsOpened: false }),
  });

  // Handle interactions (click to open, escape key/outside click to close)
  const click = useClick(context);
  const dismiss = useDismiss(context, {
    outsidePressEvent: "mousedown",
  });
  const role = useRole(context, { role: "dialog" });

  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);

  const headingId = useId();
  const descriptionId = useId();

  return (
    <FloatingPortal>
      {isSettingsOpened && (
        // Backdrop / Dimmed overlay
        <FloatingOverlay lockScroll className="fixed p-0 sm:p-10 bg-black/40 backdrop-blur-xs z-20 inset-0 flex items-center justify-center">
          <FloatingFocusManager context={context}>
            <div
              ref={refs.setFloating}
              {...getFloatingProps()}
              className="w-full h-full max-w-4xl sm:max-h-[85vh] bg-popover text-popover-foreground border border-border rounded-lg shadow-2xl overflow-hidden flex flex-col"
            >
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
            </div>
          </FloatingFocusManager>
        </FloatingOverlay>
      )}
    </FloatingPortal>
  );
}

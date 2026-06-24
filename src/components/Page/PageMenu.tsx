import { toggleCheckboxSelection } from "@/api/api";
import { Kbd } from "@/components/ui/kbd";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useContentViewMode } from "@/contexts/ContentViewModeContext";
import { useIsMobile } from "@/contexts/IsMobileContext";
import { useIsReadOnly } from "@/contexts/ReadOnlyContext";
import { cn } from "@/lib/utils";
import {
  CircleQuestionMarkIcon,
  CloudAlertIcon,
  CloudCheckIcon,
  FileCodeIcon,
  FileImageIcon,
  FilePlayIcon,
  ListChecksIcon,
  MenuIcon,
  PencilIcon,
  PencilOffIcon,
  RefreshCwIcon,
  TerminalIcon,
} from "lucide-react";
import { toast } from "sonner";
import useStore from "../../store/useStore";
import { AdaptiveMenu, AdaptiveMenuItem, AdaptiveMenuItemShortcut, AdaptiveMenuSeparator } from "../Common/AdaptiveMenu/AdaptiveMenu"; // Adjust this import path as needed
import ToolButton from "../Common/ToolButton";

declare const __APP_VERSION__: string;

export default function PageMenu() {
  const webSocketConnectionStatus = useStore((s) => s.webSocketConnectionStatus);
  const isCheckboxSelectionActive = useStore((s) => s.isCheckboxSelectionActive);

  const { contentViewMode, setContentViewMode } = useContentViewMode();
  const { isReadOnly, setIsReadOnly } = useIsReadOnly();

  const isMobile = useIsMobile();

  const Trigger = ({ ...props }) => <ToolButton tooltip="Open Page Menu" icon={<MenuIcon />} {...props} />;

  return (
    <AdaptiveMenu Trigger={Trigger} className="sm:w-max">
      <div className="py-5 sm:py-1 flex items-center justify-center gap-4">
        <Tooltip>
          <TooltipTrigger
            render={
              <Toggle
                aria-label="Toggle bookmark"
                variant="outline"
                size="adaptive"
                pressed={isReadOnly}
                onPressedChange={() => setIsReadOnly(!isReadOnly)}
              >
                {isReadOnly ? <PencilOffIcon /> : <PencilIcon />}
              </Toggle>
            }
          />
          <TooltipContent side="bottom">
            <span>Edit/Read only mode</span>
            <Kbd>E</Kbd>
          </TooltipContent>
        </Tooltip>

        <ToggleGroup
          variant="outline"
          size="adaptive"
          spacing={0}
          value={[contentViewMode]}
          onValueChange={(values) => {
            const value = values[0] as any;
            if (value) setContentViewMode(value);
          }}
        >
          <Tooltip>
            <TooltipTrigger
              render={
                <ToggleGroupItem value="markdown" aria-label="Markdown">
                  <FileImageIcon />
                </ToggleGroupItem>
              }
            />
            <TooltipContent side="bottom">
              <span>Markdown view mode</span>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              render={
                <ToggleGroupItem value="livePreview" aria-label="Live Preview">
                  <FilePlayIcon />
                </ToggleGroupItem>
              }
            />
            <TooltipContent side="bottom">
              <span>Live Preview mode</span>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              render={
                <ToggleGroupItem value="source" aria-label="Source">
                  <FileCodeIcon />
                </ToggleGroupItem>
              }
            />
            <TooltipContent side="bottom">
              <span>Source view mode</span>
            </TooltipContent>
          </Tooltip>
        </ToggleGroup>
      </div>

      <AdaptiveMenuSeparator />

      <div
        className="w-full p-2 text-xs font-normal text-muted-foreground [&_svg]:size-4 flex justify-between gap-2"
        onClick={() => {
          toast.info(`Web Socket "${webSocketConnectionStatus}"`);
        }}
      >
        <span>WS status:</span>
        <div className="flex gap-2">
          {/* {webSocketConnectionStatus === "connecting" && <CloudAlertIcon /> */}
          {webSocketConnectionStatus === "connecting" && <RefreshCwIcon className="animate-spin" />}
          {webSocketConnectionStatus === "connected" && <CloudCheckIcon />}
          {webSocketConnectionStatus === "disconnected" && <CloudAlertIcon />}
          {/* {webSocketConnectionStatus === "turned off" && <CloudCogIcon /> */}
          <span className="capitalize">{webSocketConnectionStatus}</span>
        </div>
      </div>

      <AdaptiveMenuSeparator />

      <AdaptiveMenuItem className={isCheckboxSelectionActive ? "bg-muted border border-border" : ""} onClick={() => toggleCheckboxSelection()}>
        <ListChecksIcon />
        <span>Select multiple</span>
      </AdaptiveMenuItem>

      <AdaptiveMenuItem onClick={() => useStore.setState({ isCommandPaletteOpen: true })}>
        <TerminalIcon />
        <span>Command Palette</span>
        <AdaptiveMenuItemShortcut>⌘+K</AdaptiveMenuItemShortcut>
      </AdaptiveMenuItem>

      <AdaptiveMenuItem onClick={() => toast.info(`${__APP_VERSION__}`)}>
        <CircleQuestionMarkIcon />
        <span>Help</span>
      </AdaptiveMenuItem>
    </AdaptiveMenu>
  );
}

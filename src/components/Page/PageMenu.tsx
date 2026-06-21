import { toggleCheckboxSelection } from "@/api/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Kbd } from "@/components/ui/kbd";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useContentViewMode } from "@/contexts/PlainTextViewContext";
import { useIsReadOnly } from "@/contexts/ReadOnlyContext";
import {
  CircleQuestionMarkIcon,
  CloudAlertIcon,
  CloudCheckIcon,
  FileCodeIcon,
  FileImageIcon,
  FilePlayIcon,
  ListChecksIcon,
  PencilIcon,
  PencilOffIcon,
  RefreshCwIcon,
  TerminalIcon,
} from "lucide-react";
import { toast } from "sonner";
import useStore from "../../store/useStore";

declare const __APP_VERSION__: string;

export default function PageMenu({ trigger }: { trigger: React.ReactElement }) {
  const webSocketConnectionStatus = useStore((s) => s.webSocketConnectionStatus);
  const isChekboxSelectionActive = useStore((s) => s.isCheckboxSelectionActive);

  const { contentViewMode, setContentViewMode } = useContentViewMode();
  const { isReadOnly, setIsReadOnly } = useIsReadOnly();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={trigger} />
      <DropdownMenuContent className="w-max" align="end" sideOffset={2}>
        <DropdownMenuGroup>
          <div className="p-1 flex justify-between gap-4">
            <Tooltip>
              <TooltipTrigger
                render={
                  <Toggle
                    aria-label="Toggle bookmark"
                    variant="outline"
                    size="lg"
                    pressed={isReadOnly}
                    onPressedChange={() => {
                      setIsReadOnly(!isReadOnly);
                    }}
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
              size="lg"
              spacing={0}
              value={[contentViewMode]}
              onValueChange={(values) => {
                const value = values[0] as any;
                if (!value) return;
                if (value === "markdown") {
                  setContentViewMode("markdown");
                } else if (value === "livePreview") {
                  setContentViewMode("livePreview");
                } else if (value === "source") {
                  setContentViewMode("source");
                }
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

          <DropdownMenuSeparator />

          <div
            className="w-full p-2 text-xs font-normal [&_svg]:size-4 flex justify-between gap-2"
            onClick={() => {
              toast.info(`Web Socket "${webSocketConnectionStatus}"`);
            }}
          >
            <span className="">WS status:</span>
            <div className="flex gap-2">
              {/* {webSocketConnectionStatus === "connecting" && <CloudAlertIcon /> */}
              {webSocketConnectionStatus === "connecting" && <RefreshCwIcon className="animate-spin" />}
              {webSocketConnectionStatus === "connected" && <CloudCheckIcon />}
              {webSocketConnectionStatus === "disconnected" && <CloudAlertIcon />}
              {/* {webSocketConnectionStatus === "turned off" && <CloudCogIcon /> */}
              <span className="capitalize">{webSocketConnectionStatus}</span>
            </div>
          </div>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          {/* <DropdownMenuLabel>Page</DropdownMenuLabel> */}

          <DropdownMenuItem
            className={`${isChekboxSelectionActive ? "bg-muted border border-border" : ""}`}
            onClick={() => {
              toggleCheckboxSelection();
            }}
          >
            {<ListChecksIcon />}
            <span>Select multiple</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => {
              useStore.setState({ isCommandPaletteOpen: true });
            }}
          >
            <TerminalIcon />
            <span>Command Palette</span>
            <DropdownMenuShortcut>⌘+K</DropdownMenuShortcut>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => {
              toast.info(`${__APP_VERSION__}`);
            }}
          >
            <CircleQuestionMarkIcon />
            <span>Help</span>
          </DropdownMenuItem>

          {/* END */}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

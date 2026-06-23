import { toggleCheckboxSelection } from "@/api/api";
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
import { Kbd } from "@/components/ui/kbd";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useContentViewMode } from "@/contexts/ContentViewModeContext";
import { useIsMobile } from "@/contexts/IsMobileContext";
import { useIsReadOnly } from "@/contexts/ReadOnlyContext";
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
import ToolButton from "../Common/ToolButton";

declare const __APP_VERSION__: string;

function Mobile({
  Trigger,
  webSocketConnectionStatus,
  isCheckboxSelectionActive,
  contentViewMode,
  setContentViewMode,
  isReadOnly,
  setIsReadOnly,
}: {
  Trigger: React.ComponentType<any>;
  webSocketConnectionStatus: string;
  isCheckboxSelectionActive: boolean;
  contentViewMode: "markdown" | "livePreview" | "source";
  setContentViewMode: (mode: "markdown" | "livePreview" | "source") => void;
  isReadOnly: boolean;
  setIsReadOnly: (value: boolean) => void;
}) {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Trigger />
      </DrawerTrigger>
      <DrawerContent onCloseAutoFocus={(e) => e.preventDefault()}>
        <DrawerHeader className="hidden">
          <DrawerTitle>Page Menu</DrawerTitle>
        </DrawerHeader>

        <div className="Mobile p-2 flex flex-col gap-2">
          <div className="my-5 flex items-center justify-center gap-4 ">
            <Toggle aria-label="Toggle bookmark" variant="outline" size="xl" pressed={isReadOnly} onPressedChange={() => setIsReadOnly(!isReadOnly)}>
              {isReadOnly ? <PencilOffIcon /> : <PencilIcon />}
            </Toggle>

            <ToggleGroup
              variant="outline"
              size="xl"
              spacing={0}
              value={[contentViewMode]}
              onValueChange={(values) => {
                const value = values[0] as any;
                if (value) setContentViewMode(value);
              }}
            >
              <ToggleGroupItem value="markdown" aria-label="Markdown">
                <FileImageIcon />
              </ToggleGroupItem>
              <ToggleGroupItem value="livePreview" aria-label="Live Preview">
                <FilePlayIcon />
              </ToggleGroupItem>
              <ToggleGroupItem value="source" aria-label="Source">
                <FileCodeIcon />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          <div
            className="w-full p-3 text-sm font-normal text-muted-foreground border border-border border-dashed rounded [&_svg]:size-5 flex justify-between gap-2"
            onClick={() => {
              toast.info(`Web Socket "${webSocketConnectionStatus}"`);
            }}
          >
            <span>WS status:</span>
            <div className="flex gap-2 items-center">
              {webSocketConnectionStatus === "connecting" && <RefreshCwIcon className="animate-spin" />}
              {webSocketConnectionStatus === "connected" && <CloudCheckIcon />}
              {webSocketConnectionStatus === "disconnected" && <CloudAlertIcon />}
              <span className="capitalize">{webSocketConnectionStatus}</span>
            </div>
          </div>

          {/* <Separator /> */}

          <DrawerClose asChild>
            <Button
              variant="menuitem"
              size="lg"
              className={`${isCheckboxSelectionActive ? "bg-muted border border-border" : ""}`}
              onClick={() => {
                toggleCheckboxSelection();
              }}
            >
              <ListChecksIcon />
              <span>Select multiple</span>
            </Button>
          </DrawerClose>

          <DrawerClose asChild>
            <Button
              variant="menuitem"
              size="lg"
              onClick={() => {
                useStore.setState({ isCommandPaletteOpen: true });
              }}
            >
              <TerminalIcon />
              <span>Command Palette</span>
            </Button>
          </DrawerClose>

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
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function Desktop({
  Trigger,
  webSocketConnectionStatus,
  isCheckboxSelectionActive,
  contentViewMode,
  setContentViewMode,
  isReadOnly,
  setIsReadOnly,
}: {
  Trigger: React.ComponentType<any>;
  webSocketConnectionStatus: string;
  isCheckboxSelectionActive: boolean;
  contentViewMode: "markdown" | "livePreview" | "source";
  setContentViewMode: (mode: "markdown" | "livePreview" | "source") => void;
  isReadOnly: boolean;
  setIsReadOnly: (value: boolean) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Trigger />} />
      <DropdownMenuContent className="w-max" align="end" sideOffset={2}>
        <DropdownMenuGroup>
          <div className="p-1 flex justify-center gap-4">
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
            className="w-full p-2 text-xs font-normal text-muted-foreground [&_svg]:size-4 flex justify-between gap-2"
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
            className={`${isCheckboxSelectionActive ? "bg-muted border border-border" : ""}`}
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

export default function PageMenu() {
  const webSocketConnectionStatus = useStore((s) => s.webSocketConnectionStatus);
  const isCheckboxSelectionActive = useStore((s) => s.isCheckboxSelectionActive);

  const { contentViewMode, setContentViewMode } = useContentViewMode();
  const { isReadOnly, setIsReadOnly } = useIsReadOnly();

  const isMobile = useIsMobile();

  const Trigger = ({ ...props }) => <ToolButton tooltip="Open Page Menu" icon={<MenuIcon />} {...props} />;

  return isMobile ? (
    <Mobile
      Trigger={Trigger}
      webSocketConnectionStatus={webSocketConnectionStatus}
      isCheckboxSelectionActive={isCheckboxSelectionActive}
      contentViewMode={contentViewMode}
      setContentViewMode={setContentViewMode}
      isReadOnly={isReadOnly}
      setIsReadOnly={setIsReadOnly}
    />
  ) : (
    <Desktop
      Trigger={Trigger}
      webSocketConnectionStatus={webSocketConnectionStatus}
      isCheckboxSelectionActive={isCheckboxSelectionActive}
      contentViewMode={contentViewMode}
      setContentViewMode={setContentViewMode}
      isReadOnly={isReadOnly}
      setIsReadOnly={setIsReadOnly}
    />
  );
}

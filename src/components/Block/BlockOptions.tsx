import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getItem, getItemDescendants, isRootItem } from "esm-treero-api";
import {
  ArrowDownAZIcon,
  ArrowDownNarrowWideIcon,
  ArrowDownZAIcon,
  EllipsisVerticalIcon,
  ForwardIcon,
  InboxIcon,
  LinkIcon,
  MinusIcon,
  PlusIcon,
  PrinterIcon,
  Trash2Icon,
  UploadIcon,
  ZoomInIcon,
} from "lucide-react";
import { copyToClipboard, handleBlockDelete, handleBlockOpen } from "../../api/api";
import useStore from "../../store/useStore";
import yjs from "../../store/yjsManager";
// import { Drawer } from "@/components/ui/drawer";

export function BlockOptions({ id, isRoot }: { id: string; isRoot: boolean }) {
  const isChekboxSelectionActive = useStore((s) => s.isCheckboxSelectionActive);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button className="" variant="bare" size="micro">
            <EllipsisVerticalIcon className="" />
          </Button>
        }
      ></DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuLabel>Block options</DropdownMenuLabel>

          <DropdownMenuItem
            onClick={async () => {
              await handleBlockOpen(id);
            }}
          >
            <ZoomInIcon />
            <span>Zoom in</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={isChekboxSelectionActive}
            onClick={() => {
              useStore.setState({ isMoveToOpen: true, itemIdToMove: id });
            }}
          >
            <ForwardIcon />
            <span>Move to</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              if (!isRootItem(yjs.yblocks, id)) {
                getItem(yjs.yblocks, id).set("collapsed", false);
              }
              for (const yitem of getItemDescendants(yjs.yblocks, id)) {
                yitem.set("collapsed", false);
              }
            }}
          >
            <PlusIcon />
            <span>Expand All</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              if (!isRootItem(yjs.yblocks, id)) {
                getItem(yjs.yblocks, id).set("collapsed", true);
              }
              for (const yitem of getItemDescendants(yjs.yblocks, id)) {
                yitem.set("collapsed", true);
              }
            }}
          >
            <MinusIcon />
            <span>Collapse All</span>
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <ArrowDownNarrowWideIcon />
              <span>Sort</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem>
                  <ArrowDownAZIcon />
                  <span>Ascending</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <ArrowDownZAIcon />
                  <span>Descending</span>
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          <DropdownMenuItem>
            <InboxIcon />
            <span>Set as Inbox</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <UploadIcon />
            <span>Export</span>
          </DropdownMenuItem>
          {/* TODO: Move to Export */}
          <DropdownMenuItem>
            <PrinterIcon />
            <span>Print</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={async () => {
              await copyToClipboard(`${window.location.origin}/#${id}`);
            }}
          >
            <LinkIcon />
            <span>Copy link</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            variant="destructive"
            disabled={isChekboxSelectionActive}
            onClick={() => {
              handleBlockDelete(id);
            }}
          >
            <Trash2Icon />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

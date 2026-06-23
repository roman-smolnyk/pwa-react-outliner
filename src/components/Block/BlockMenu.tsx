import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
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
import { Separator } from "@/components/ui/separator";
import useIsMobile from "@/hooks/useIsMobile";
import { getItem, getItemDescendants, isRootItem } from "esm-treero-api";
import {
  ArrowDownAZIcon,
  ArrowDownNarrowWideIcon,
  ArrowDownZAIcon,
  ChevronDownIcon,
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
import React from "react";
import { copyToClipboard, handleBlockDelete, handleBlockOpen, handleSetAsInbox, handleSortBlockChildren } from "../../api/api";
import useStore from "../../store/useStore";
import yjs from "../../store/yjsManager";

async function handleExpandAll(id: string) {
  if (!isRootItem(yjs.yblocks, id)) {
    getItem(yjs.yblocks, id).set("collapsed", false);
  }
  for (const yitem of getItemDescendants(yjs.yblocks, id)) {
    yitem.set("collapsed", false);
  }
}

async function handleCollapseAll(id: string) {
  if (!isRootItem(yjs.yblocks, id)) {
    getItem(yjs.yblocks, id).set("collapsed", true);
  }
  for (const yitem of getItemDescendants(yjs.yblocks, id)) {
    yitem.set("collapsed", true);
  }
}

function Mobile({ Trigger, id, isCheckboxSelectionActive }: { Trigger: React.ComponentType<any>; id: string; isCheckboxSelectionActive: boolean }) {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Trigger />
      </DrawerTrigger>
      <DrawerContent onCloseAutoFocus={(e) => e.preventDefault()}>
        <DrawerHeader>
          <DrawerTitle>Block options</DrawerTitle>
        </DrawerHeader>

        <div className="p-2 no-scrollbar overflow-y-auto flex flex-col gap-2">
          <DrawerClose asChild>
            <Button variant="menuitem" size="lg" onClick={() => handleBlockOpen(id)}>
              <ZoomInIcon />
              <span>Zoom in</span>
            </Button>
          </DrawerClose>

          <DrawerClose asChild>
            <Button
              variant="menuitem"
              size="lg"
              disabled={isCheckboxSelectionActive}
              onClick={() => useStore.setState({ isMoveToOpen: true, itemIdToMove: id })}
            >
              <ForwardIcon />
              <span>Move to</span>
            </Button>
          </DrawerClose>

          <DrawerClose asChild>
            <Button variant="menuitem" size="lg" onClick={() => handleExpandAll(id)}>
              <PlusIcon />
              <span>Expand All</span>
            </Button>
          </DrawerClose>

          <DrawerClose asChild>
            <Button variant="menuitem" size="lg" onClick={() => handleCollapseAll(id)}>
              <MinusIcon />
              <span>Collapse All</span>
            </Button>
          </DrawerClose>

          <Collapsible>
            <CollapsibleTrigger
              render={
                <Button variant="ghost" size="lg" className="w-full">
                  <ArrowDownNarrowWideIcon />
                  <span>Sort</span>
                  <ChevronDownIcon className="ml-auto group-data-panel-open/button:rotate-180" />
                </Button>
              }
            />
            <CollapsibleContent className="pl-6 flex flex-col gap-2">
              <DrawerClose asChild>
                <Button variant="menuitem" size="lg" onClick={() => handleSortBlockChildren(id)}>
                  <ArrowDownAZIcon />
                  <span>Ascending</span>
                </Button>
              </DrawerClose>
              <DrawerClose asChild>
                <Button variant="menuitem" size="lg" onClick={() => handleSortBlockChildren(id, { descending: true })}>
                  <ArrowDownZAIcon />
                  <span>Descending</span>
                </Button>
              </DrawerClose>
            </CollapsibleContent>
          </Collapsible>

          <DrawerClose asChild>
            <Button variant="menuitem" size="lg" onClick={() => handleSetAsInbox(id)}>
              <InboxIcon />
              <span>Set as Inbox</span>
            </Button>
          </DrawerClose>

          <DrawerClose asChild>
            <Button variant="menuitem" size="lg">
              <UploadIcon />
              <span>Export</span>
            </Button>
          </DrawerClose>

          <DrawerClose asChild>
            <Button variant="menuitem" size="lg" onClick={() => useStore.setState({ idToPrint: id })}>
              <PrinterIcon />
              <span>Print</span>
            </Button>
          </DrawerClose>

          <DrawerClose asChild>
            <Button variant="menuitem" size="lg" onClick={() => copyToClipboard(`${window.location.origin}/#${id}`)}>
              <LinkIcon />
              <span>Copy link</span>
            </Button>
          </DrawerClose>

          <Separator />

          <DrawerClose asChild>
            <Button
              variant="menuitem"
              size="lg"
              className="text-destructive"
              disabled={isCheckboxSelectionActive}
              onClick={() => handleBlockDelete(id)}
            >
              <Trash2Icon />
              <span>Delete</span>
            </Button>
          </DrawerClose>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function Desktop({ Trigger, id, isCheckboxSelectionActive }: { Trigger: React.ComponentType<any>; id: string; isCheckboxSelectionActive: boolean }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Trigger />} />
      <DropdownMenuContent className="w-max">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Block options</DropdownMenuLabel>

          <DropdownMenuItem onClick={() => handleBlockOpen(id)}>
            <ZoomInIcon />
            <span>Zoom in</span>
          </DropdownMenuItem>

          <DropdownMenuItem disabled={isCheckboxSelectionActive} onClick={() => useStore.setState({ isMoveToOpen: true, itemIdToMove: id })}>
            <ForwardIcon />
            <span>Move to</span>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => handleExpandAll(id)}>
            <PlusIcon />
            <span>Expand All</span>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => handleCollapseAll(id)}>
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
                <DropdownMenuItem onClick={() => handleSortBlockChildren(id)}>
                  <ArrowDownAZIcon />
                  <span>Ascending</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSortBlockChildren(id, { descending: true })}>
                  <ArrowDownZAIcon />
                  <span>Descending</span>
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          <DropdownMenuItem onClick={() => handleSetAsInbox(id)}>
            <InboxIcon />
            <span>Set as Inbox</span>
          </DropdownMenuItem>

          <DropdownMenuItem className="text-warning">
            <UploadIcon />
            <span>Export</span>
          </DropdownMenuItem>
          {/* TODO: Move to Export */}
          <DropdownMenuItem onClick={() => useStore.setState({ idToPrint: id })}>
            <PrinterIcon />
            <span>Print</span>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => copyToClipboard(`${window.location.origin}/#${id}`)}>
            <LinkIcon />
            <span>Copy link</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem variant="destructive" disabled={isCheckboxSelectionActive} onClick={() => handleBlockDelete(id)}>
            <Trash2Icon />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function BlockMenu({ id, isRoot }: { id: string; isRoot: boolean }) {
  const isMobile = useIsMobile();
  const isCheckboxSelectionActive = useStore((s) => s.isCheckboxSelectionActive);
  const idToPrint = useStore((s) => s.idToPrint);

  if (idToPrint) {
    return null;
  }

  const Trigger = ({ ...props }) => {
    return (
      <Button className="BlockOptions" variant="bare" size="micro" {...props}>
        <EllipsisVerticalIcon />
      </Button>
    );
  };

  return isMobile ? (
    <Mobile id={id} isCheckboxSelectionActive={isCheckboxSelectionActive} Trigger={Trigger} />
  ) : (
    <Desktop id={id} isCheckboxSelectionActive={isCheckboxSelectionActive} Trigger={Trigger} />
  );
}

import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
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
import { COLLECTION_TYPE, getPage, PAGE_TYPE } from "esm-treero-api";
import {
  ArrowDownAZIcon,
  ArrowDownNarrowWideIcon,
  ArrowDownZAIcon,
  ChevronDownIcon,
  EllipsisVerticalIcon,
  FilePlusIcon,
  FolderPlusIcon,
  ForwardIcon,
  SquarePenIcon,
  Trash2Icon,
  UploadIcon,
} from "lucide-react";
import React from "react";
import { handleCollectionAdd, handleCollectionDelete, handlePageAdd, handlePageDelete } from "../../api/api";
import useStore from "../../store/useStore";
import yjs from "../../store/yjsManager";

function handleMoveTo(id: string) {
  const ypage = getPage(yjs.ydoc, id);
  useStore.setState({
    isMoveToOpen: true,
    itemIdToMove: ypage.get("id"),
  });
}

function handleDelete(id: string, type: number) {
  if (type === COLLECTION_TYPE) {
    handleCollectionDelete(id);
  } else if (type === PAGE_TYPE) {
    handlePageDelete(id);
  }
}

function Mobile({
  Trigger,
  id,
  type,
  setIsRename,
}: {
  Trigger: React.ComponentType<any>;
  id: string;
  type: number;
  setIsRename: (v: boolean) => void;
}) {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Trigger />
      </DrawerTrigger>
      <DrawerContent>
        {/* Accessibility header */}
        <DrawerHeader>
          <DrawerTitle>{`${type === PAGE_TYPE ? "Document" : "Folder"} options`}</DrawerTitle>
        </DrawerHeader>

        <div className="p-2 flex flex-col gap-2">
          <DrawerClose asChild>
            <Button
              variant="menuitem"
              size="lg"
              onClick={() => {
                // Drawer steals focus
                requestAnimationFrame(() => {
                  setTimeout(() => {
                    setIsRename(true);
                  }, 750);
                });
              }}
            >
              <SquarePenIcon />
              <span>Rename</span>
            </Button>
          </DrawerClose>

          {type === COLLECTION_TYPE && (
            <>
              <DrawerClose asChild>
                <Button variant="menuitem" size="lg" onClick={() => handlePageAdd(id)}>
                  <FilePlusIcon />
                  <span>New Document</span>
                </Button>
              </DrawerClose>

              <DrawerClose asChild>
                <Button variant="menuitem" size="lg" onClick={() => handleCollectionAdd(id)}>
                  <FolderPlusIcon />
                  <span>New Folder</span>
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
                    <Button variant="menuitem" size="lg">
                      <ArrowDownAZIcon />
                      <span>Ascending</span>
                    </Button>
                  </DrawerClose>
                  <DrawerClose asChild>
                    <Button variant="menuitem" size="lg">
                      <ArrowDownZAIcon />
                      <span>Descending</span>
                    </Button>
                  </DrawerClose>
                </CollapsibleContent>
              </Collapsible>
            </>
          )}

          {type === PAGE_TYPE && (
            <>
              <DrawerClose asChild>
                <Button variant="menuitem" size="lg" onClick={() => handleMoveTo(id)}>
                  <ForwardIcon />
                  <span>Move to</span>
                </Button>
              </DrawerClose>

              <DrawerClose asChild>
                <Button variant="menuitem" size="lg">
                  <UploadIcon />
                  <span>Export</span>
                </Button>
              </DrawerClose>
            </>
          )}

          <Separator />

          <DrawerClose asChild>
            <Button variant="menuitem" size="lg" className="text-destructive" onClick={() => handleDelete(id, type)}>
              <Trash2Icon />
              <span>Delete</span>
            </Button>
          </DrawerClose>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function Desktop({
  Trigger,
  id,
  type,
  setIsRename,
}: {
  Trigger: React.ComponentType<any>;
  id: string;
  type: number;
  setIsRename: (v: boolean) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Trigger />} />
      <DropdownMenuContent className="w-max">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{`${type === PAGE_TYPE ? "Document" : "Folder"} options`}</DropdownMenuLabel>

          <DropdownMenuItem
            onClick={() => {
              setIsRename(true);
            }}
          >
            <SquarePenIcon />
            <span>Rename</span>
          </DropdownMenuItem>

          {type === COLLECTION_TYPE && (
            <>
              <DropdownMenuItem
                onClick={() => {
                  handlePageAdd(id);
                }}
              >
                <FilePlusIcon />
                <span>New Document</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  handleCollectionAdd(id);
                }}
              >
                <FolderPlusIcon />
                <span>New Folder</span>
              </DropdownMenuItem>
            </>
          )}

          {type === COLLECTION_TYPE && (
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
                  <DropdownMenuItem></DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          )}

          {type === PAGE_TYPE && (
            <DropdownMenuItem onClick={() => handleMoveTo(id)}>
              <ForwardIcon />
              <span>Move to</span>
            </DropdownMenuItem>
          )}

          {type === PAGE_TYPE && (
            <DropdownMenuItem>
              <UploadIcon />
              <span>Export</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem variant="destructive" onClick={() => handleDelete(id, type)}>
            <Trash2Icon />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function ExpEntryOptions({ id, type, setIsRename }: { id: string; type: number; setIsRename: (v: boolean) => void }) {
  const isMobile = useIsMobile();

  const Trigger = ({ ...props }) => {
    return (
      <Button variant="ghost" size="icon-sm" {...props}>
        <EllipsisVerticalIcon />
      </Button>
    );
  };

  return isMobile ? (
    <Mobile Trigger={Trigger} id={id} type={type} setIsRename={setIsRename} />
  ) : (
    <Desktop Trigger={Trigger} id={id} type={type} setIsRename={setIsRename} />
  );
}

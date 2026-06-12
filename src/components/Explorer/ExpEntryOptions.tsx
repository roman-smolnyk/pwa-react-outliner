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
import { COLLECTION_TYPE, getPage, PAGE_TYPE } from "esm-treero-api";
import {
  ArrowDownAZIcon,
  ArrowDownNarrowWideIcon,
  ArrowDownZAIcon,
  EllipsisVerticalIcon,
  FilePlusIcon,
  FolderPlusIcon,
  ForwardIcon,
  SquarePenIcon,
  Trash2Icon,
  UploadIcon,
} from "lucide-react";
import { handleCollectionAdd, handleCollectionDelete, handlePageAdd, handlePageDelete } from "../../api/api";
import useStore from "../../store/useStore";
import yjs from "../../store/yjsManager";

export default function ExpEntryOptions({ id, type, setIsRename }: { id: string; type: number; setIsRename: (v: boolean) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon-sm" className="ExpEntryOptions">
            <EllipsisVerticalIcon />
          </Button>
        }
      />
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
            <DropdownMenuItem
              onClick={() => {
                const ypage = getPage(yjs.ydoc, id);
                useStore.setState({
                  isMoveToOpen: true,
                  itemIdToMove: ypage.get("id"),
                });
              }}
            >
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
          <DropdownMenuItem
            variant="destructive"
            onClick={() => {
              if (type === COLLECTION_TYPE) {
                handleCollectionDelete(id);
              } else if (type === PAGE_TYPE) {
                handlePageDelete(id);
              }
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

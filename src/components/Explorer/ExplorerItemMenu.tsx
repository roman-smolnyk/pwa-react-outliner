import { Button } from "@/components/ui/button";
import { COLLECTION_TYPE, getPage, PAGE_TYPE } from "esm-treero-api";
import {
  ArrowDownAZIcon,
  ArrowDownNarrowWideIcon,
  ArrowDownZAIcon,
  BookmarkIcon,
  BookmarkOffIcon,
  EllipsisVerticalIcon,
  FilePlusIcon,
  FolderPlusIcon,
  ForwardIcon,
  SquarePenIcon,
  Trash2Icon,
  UploadIcon,
} from "lucide-react";
import {
  handleBookmarkAdd,
  handleBookmarkRemove,
  handleCollectionAdd,
  handleCollectionDelete,
  handlePageAdd,
  handlePageDelete,
  handleSortCollectionChildren,
} from "../../api/api";
import useStore from "../../store/useStore";
import yjs from "../../store/yjsManager";
import { AdaptiveMenu, AdaptiveMenuItem, AdaptiveMenuSeparator, AdaptiveMenuSub } from "../Common/AdaptiveMenu/AdaptiveMenu"; // Adjust this import path as needed

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

export default function ExplorerItemMenu({
  id,
  type,
  isBookmarked,
  setIsRename,
}: {
  id: string;
  type: number;
  isBookmarked: boolean;
  setIsRename: (v: boolean) => void;
}) {
  // log.debug("ExplorerItemMenu")
  const Trigger = ({ ...props }) => (
    <Button variant="ghost" size="icon-sm" {...props}>
      <EllipsisVerticalIcon />
    </Button>
  );

  return (
    <AdaptiveMenu Trigger={Trigger} label={`${type === PAGE_TYPE ? "Document" : "Folder"} menu`} className="sm:w-max">
      <AdaptiveMenuItem onClick={() => setIsRename(true)}>
        <SquarePenIcon />
        <span>Rename</span>
      </AdaptiveMenuItem>

      {type === COLLECTION_TYPE && (
        <>
          <AdaptiveMenuItem onClick={() => handlePageAdd(id)}>
            <FilePlusIcon />
            <span>New Document</span>
          </AdaptiveMenuItem>

          <AdaptiveMenuItem onClick={() => handleCollectionAdd(id)}>
            <FolderPlusIcon />
            <span>New Folder</span>
          </AdaptiveMenuItem>

          <AdaptiveMenuSub
            item={
              <>
                <ArrowDownNarrowWideIcon />
                <span>Sort</span>
              </>
            }
          >
            <AdaptiveMenuItem onClick={() => handleSortCollectionChildren(id)}>
              <ArrowDownAZIcon />
              <span>Ascending</span>
            </AdaptiveMenuItem>
            <AdaptiveMenuItem onClick={() => handleSortCollectionChildren(id, { descending: true })}>
              <ArrowDownZAIcon />
              <span>Descending</span>
            </AdaptiveMenuItem>
          </AdaptiveMenuSub>
        </>
      )}

      {/* Document conditional features */}
      {type === PAGE_TYPE && (
        <>
          <AdaptiveMenuItem onClick={() => handleMoveTo(id)}>
            <ForwardIcon />
            <span>Move to</span>
          </AdaptiveMenuItem>

          <AdaptiveMenuItem
            onClick={() => {
              if (isBookmarked) {
                handleBookmarkRemove(id);
              } else {
                handleBookmarkAdd(id);
              }
            }}
          >
            {isBookmarked ? <BookmarkOffIcon /> : <BookmarkIcon />}
            <span>{isBookmarked ? "Unbookmark" : "Bookmark"}</span>
          </AdaptiveMenuItem>

          <AdaptiveMenuItem>
            <UploadIcon />
            <span>Export</span>
          </AdaptiveMenuItem>
        </>
      )}

      <AdaptiveMenuSeparator />

      <AdaptiveMenuItem destructive onClick={() => handleDelete(id, type)}>
        <Trash2Icon />
        <span>Delete</span>
      </AdaptiveMenuItem>
    </AdaptiveMenu>
  );
}

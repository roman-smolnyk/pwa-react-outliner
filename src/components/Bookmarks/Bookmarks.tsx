import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import useActiveYPage from "@/hooks/useActiveYPage";
import useBookmarks from "@/hooks/useBookmarks";
import yjs from "@/store/yjsManager";
import { DragDropProvider } from "@dnd-kit/react";
import { isSortable } from "@dnd-kit/react/sortable";
import { getPage, moveBookmark } from "esm-treero-api";
import Bookmark from "./Bookmark";

export default function Bookmarks() {
  const bookmarks = useBookmarks();
  const activeYPage = useActiveYPage();

  function EmptyBookmarks() {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>No Bookmarks</EmptyTitle>
          <EmptyDescription>Add Bookmark via Document menu</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <DragDropProvider
      onDragEnd={(event) => {
        if (event.canceled) return;
        // if (!isSortableOperation(e.operation)) return;

        const { source } = event.operation;

        if (isSortable(source)) {
          const { initialIndex, index, id } = source;

          if (initialIndex !== index) {
            moveBookmark(yjs.ydoc, id as string, index);
          }
        }
      }}
    >
      <div data-component="Bookmarks">
        {bookmarks.length === 0 && <EmptyBookmarks />}
        {bookmarks.map((id, idx) => {
          const ypage = getPage(yjs.ydoc, id);
          return (
            <Bookmark
              key={`bookmark-${id}`}
              id={ypage.get("id")}
              index={idx}
              title={ypage.get("title")}
              isSelected={ypage.get("id") === activeYPage?.get("id")}
            />
          );
        })}
      </div>
    </DragDropProvider>
  );
}

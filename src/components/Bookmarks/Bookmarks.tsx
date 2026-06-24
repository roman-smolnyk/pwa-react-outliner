import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import useActiveYPage from "@/hooks/useActiveYPage";
import useBookmarks from "@/hooks/useBookmarks";
import yjs from "@/store/yjsManager";
import { getPage } from "esm-treero-api";
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
    <div>
      {bookmarks.length === 0 && <EmptyBookmarks />}
      {bookmarks.map((id) => {
        const ypage = getPage(yjs.ydoc, id);
        return (
          <Bookmark key={`bookmark-${id}`} id={ypage.get("id")} title={ypage.get("title")} isSelected={ypage.get("id") === activeYPage?.get("id")} />
        );
      })}
    </div>
  );
}

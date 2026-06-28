import { handleBlockOpenViaPageId } from "@/api/api";
import { Button } from "@/components/ui/button";
import { useSortable } from "@dnd-kit/react/sortable";
import { BookmarkIcon } from "lucide-react";
import BookmarkMenu from "./BookmarkMenu";

export default function Bookmark({ id, index, title, isSelected }: { id: string; index: number; title: string; isSelected: boolean }) {
  const { ref, handleRef } = useSortable({ id, index });
  return (
    <div
      ref={ref}
      data-component="Bookmark"
      className={`relative min-w-0 pr-3 ${
        isSelected
          ? "bg-sidebar-accent text-sidebar-accent-foreground border-l-16 border-sidebar-accent"
          : "border-l-16 border-transparent hover:bg-sidebar-accent hover:border-sidebar-accent hover:text-sidebar-accent-foreground"
      }`}
    >
      <div className={`min-w-0 flex items-center justify-center`}>
        <Button ref={handleRef} variant="bare" className="size-6 p-0.5">
          <BookmarkIcon className="" />
        </Button>

        <div className="flex-1 min-w-0 flex">
          <div className="w-full min-w-0 pl-1 py-1 cursor-pointer select-none truncate" onClick={() => handleBlockOpenViaPageId(id)}>
            {title}
          </div>
        </div>

        <BookmarkMenu id={id} />
      </div>
    </div>
  );
}

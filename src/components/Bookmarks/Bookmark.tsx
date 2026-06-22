import { Button } from "@/components/ui/button";
import { BookmarkIcon } from "lucide-react";
import BookmarkOptions from "./BookmarkOptions";

export default function Bookmark({ id, title, isSelected }: { id: string; title: string; isSelected: boolean }) {
  return (
    <div
      className={`ExpEntryInner relative min-w-0 pr-3 ${
        isSelected
          ? "bg-sidebar-accent text-sidebar-accent-foreground border-l-16 border-sidebar-accent"
          : "border-l-16 border-transparent hover:bg-sidebar-accent hover:border-sidebar-accent hover:text-sidebar-accent-foreground"
      }`}
    >
      <div className={`min-w-0 flex items-center justify-center`}>
        <Button variant="ghost" size="icon-sm" className="">
          <BookmarkIcon className="fill-primary" />
        </Button>

        <div className="flex-1 min-w-0 flex">
          <div className="w-full min-w-0 flex cursor-pointer" onClick={() => {}}>
            <div className="Title w-full py-1 select-none truncate">{title}</div>
          </div>
        </div>

        <BookmarkOptions id={id} />
      </div>
    </div>
  );
}

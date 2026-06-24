import { Button } from "@/components/ui/button";
import { BookmarkOffIcon, EllipsisVerticalIcon } from "lucide-react";
import { handleBookmarkRemove } from "../../api/api";
import { AdaptiveMenu, AdaptiveMenuItem } from "../Common/AdaptiveMenu/AdaptiveMenu";

export default function BookmarkMenu({ id }: { id: string }) {
  const Trigger = ({ ...props }) => (
    <Button variant="ghost" size="icon-sm" {...props}>
      <EllipsisVerticalIcon />
    </Button>
  );

  return (
    <AdaptiveMenu Trigger={Trigger} label="Bookmark menu">
      <AdaptiveMenuItem onClick={() => handleBookmarkRemove(id)}>
        <BookmarkOffIcon />
        <span>Unbookmark</span>
      </AdaptiveMenuItem>
    </AdaptiveMenu>
  );
}

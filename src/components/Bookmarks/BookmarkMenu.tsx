import { Button } from "@/components/ui/button";
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useIsMobile from "@/hooks/useIsMobile";
import { BookmarkOffIcon, EllipsisVerticalIcon } from "lucide-react";
import React from "react";
import { handleBookmarkRemove } from "../../api/api";

function Mobile({ Trigger, id }: { Trigger: React.ComponentType<any>; id: string }) {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Trigger />
      </DrawerTrigger>
      <DrawerContent onCloseAutoFocus={(e) => e.preventDefault()}>
        {/* Accessibility header */}
        <DrawerHeader>
          <DrawerTitle>Bookmark options</DrawerTitle>
        </DrawerHeader>

        <div className="p-2 flex flex-col gap-2">
          <DrawerClose asChild>
            <Button variant="menuitem" size="lg" onClick={() => handleBookmarkRemove(id)}>
              <BookmarkOffIcon />
              <span>Unbookmark</span>
            </Button>
          </DrawerClose>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function Desktop({ Trigger, id }: { Trigger: React.ComponentType<any>; id: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Trigger />} />
      <DropdownMenuContent className="w-max">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Bookmark options</DropdownMenuLabel>

          <DropdownMenuItem onClick={() => handleBookmarkRemove(id)}>
            <BookmarkOffIcon />
            <span>Unbookmark</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function BookmarkMenu({ id }: { id: string }) {
  const isMobile = useIsMobile();

  const Trigger = ({ ...props }) => {
    return (
      <Button variant="ghost" size="icon-sm" {...props}>
        <EllipsisVerticalIcon />
      </Button>
    );
  };

  return isMobile ? <Mobile Trigger={Trigger} id={id} /> : <Desktop Trigger={Trigger} id={id} />;
}

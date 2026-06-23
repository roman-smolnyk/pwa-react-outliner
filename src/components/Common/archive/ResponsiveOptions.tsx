import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/contexts/IsMobileContext";
import type { LucideIcon } from "lucide-react";
import React from "react";

export interface MenuItem {
  label: string;
  icon?: LucideIcon;
  onClick?: () => void;
}

export default function ResponsiveDropdown({ menuItems, Trigger }: { menuItems: MenuItem[]; Trigger: React.ComponentType<any> }) {
  const isMobile = useIsMobile();

  return isMobile ? (
    <Drawer>
      <DrawerTrigger asChild>
        <Trigger />
      </DrawerTrigger>
      <DrawerContent onCloseAutoFocus={(e) => e.preventDefault()}>
        {/* Required by accessibility */}
        <DrawerHeader className="hidden">
          <DrawerTitle>Drawer Title</DrawerTitle>
          <DrawerDescription>Drawer Description</DrawerDescription>
        </DrawerHeader>
        <div className="p-2 flex flex-col">
          {menuItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <React.Fragment key={`ResponsiveDropdown-${idx}`}>
                <Button variant="ghost" size="lg" className="flex justify-start gap-3 w-full" onClick={item.onClick} type="button">
                  {Icon && <Icon />}
                  <span>{item.label}</span>
                </Button>
                {idx < menuItems.length - 1 && <Separator />}
              </React.Fragment>
            );
          })}
        </div>
      </DrawerContent>
    </Drawer>
  ) : (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Trigger />}></DropdownMenuTrigger>
      <DropdownMenuContent side="bottom" align="end">
        <DropdownMenuGroup>
          {menuItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <DropdownMenuItem key={`ResponsiveDropdown-${idx}`} onClick={item.onClick}>
                {Icon && <Icon />}
                <span>{item.label}</span>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

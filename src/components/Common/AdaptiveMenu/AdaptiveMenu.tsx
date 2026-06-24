import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Kbd } from "@/components/ui/kbd";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/contexts/IsMobileContext";
import { cn } from "@/lib/utils";
import { ChevronLeftIcon } from "lucide-react";

// export function AdaptiveMenuSubTrigger({ children }: { children: React.ReactNode }) {
//   const isMobile = useIsMobile();
//   return isMobile ? (
//     <CollapsibleTrigger
//       render={
//         <Button variant="ghost" size="lg" className="w-full">
//           {children}
//           <ChevronDownIcon className="ml-auto group-data-panel-open/button:rotate-180" />
//         </Button>
//       }
//     />
//   ) : (
//     <DropdownMenuShortcut>{children}</DropdownMenuShortcut>
//   );
// }

export function AdaptiveMenuSeparator() {
  const isMobile = useIsMobile();

  return isMobile ? <Separator className="my-1" /> : <DropdownMenuSeparator />;
}

export function AdaptiveMenuItemShortcut({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();

  return isMobile ? <Kbd className="ml-auto">{children}</Kbd> : <DropdownMenuShortcut>{children}</DropdownMenuShortcut>;
}

export function AdaptiveMenuItem({
  children,
  onClick,
  className,
  destructive,
  disabled,
  ...props
}: {
  children: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  className?: string;
  destructive?: boolean;
  disabled?: boolean;
}) {
  const isMobile = useIsMobile();

  return isMobile ? (
    <DrawerClose asChild>
      <Button
        variant="ghost"
        size="lg"
        className={cn("w-full flex justify-start gap-3", destructive ? "text-destructive dark:text-destructive" : "", className)}
        onClick={onClick}
        disabled={disabled}
        {...props}
      >
        {children}
      </Button>
    </DrawerClose>
  ) : (
    <DropdownMenuItem
      variant={destructive ? "destructive" : "default"}
      className={cn("", className)}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </DropdownMenuItem>
  );
}

export function AdaptiveMenuSub({ children, item }: { children: React.ReactNode; item: React.ReactNode }) {
  const isMobile = useIsMobile();

  return isMobile ? (
    <Collapsible>
      <CollapsibleTrigger
        render={
          <Button variant="ghost" size="lg" className="w-full">
            {item}
            <ChevronLeftIcon className="ml-auto group-data-panel-open/button:-rotate-90" />
          </Button>
        }
      />
      <CollapsibleContent className="pl-6 flex flex-col gap-2">{children}</CollapsibleContent>
    </Collapsible>
  ) : (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>{item}</DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent>{children}</DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  );
}

export function AdaptiveMenu({
  children,
  Trigger,
  label,
  className,
}: {
  children: React.ReactNode;
  Trigger: React.ComponentType<any>;
  label?: string;
  className?: string;
}) {
  const isMobile = useIsMobile();

  return isMobile ? (
    <Drawer>
      <DrawerTrigger asChild>
        <Trigger />
      </DrawerTrigger>
      <DrawerContent onCloseAutoFocus={(e) => e.preventDefault()}>
        {/* Required by accessibility */}
        <DrawerHeader className={label ? "" : "hidden"}>
          <DrawerTitle>{label ? label : "Drawer Title"}</DrawerTitle>
        </DrawerHeader>
        <div className={cn("Mobile p-2 flex flex-col gap-1", className)}>{children}</div>
      </DrawerContent>
    </Drawer>
  ) : (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Trigger />} />
      <DropdownMenuContent className={cn("", className)}>
        <DropdownMenuGroup>
          {label && <DropdownMenuLabel>{label}</DropdownMenuLabel>}
          {children}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

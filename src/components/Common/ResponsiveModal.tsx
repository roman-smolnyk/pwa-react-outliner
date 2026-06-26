import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useIsMobile } from "@/contexts/IsMobileContext";
import { cn } from "@/lib/utils";

export default function ResponsiveModal({
  children,
  title,
  open,
  onOpenChange,
  className = "",
}: {
  children: React.ReactNode;
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  className?: string;
}) {
  const isMobile = useIsMobile();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-component="ResponsiveModal"
        className={
          isMobile
            ? "top-0 left-0 translate-x-0 translate-y-0 w-dvw h-dvh max-w-none max-h-none rounded-none flex flex-col"
            : "min-w-2/3 h-5/6 flex flex-col"
        }
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className={cn("flex-1 min-h-0 pt-4 flex flex-col", className)}>{children}</div>
      </DialogContent>
    </Dialog>
  );
}

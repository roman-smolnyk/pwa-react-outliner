import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function FloatingToolbar({
  children,
  open,
  onOpenChange,
  className = "",
}: {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}) {
  return (
    <div
      className="FloatingToolbar fixed top-12 left-0 right-0 flex items-center"
      style={{
        left: "var(--explorer-width)",
      }}
    >
      <div className="w-max mx-auto">
        <Card className={cn("p-2 max-w-[90dvw] flex flex-row items-center justify-center gap-1", className)}>{children}</Card>
      </div>
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import React from "react";

export default function ToolButton({
  tooltip,
  icon,
  hotkey,
  className,
  onClick,
}: {
  tooltip: string;
  icon: React.ReactNode;
  hotkey?: string[];
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button variant="bare" size="tool" className={cn("Tool", className)} onClick={onClick}>
            {icon}
          </Button>
        }
      />
      <TooltipContent>
        {tooltip}
        <KbdGroup>
          {hotkey?.map((item, idx) => {
            return (
              <React.Fragment key={`kbd-${idx}`}>
                <Kbd>{item}</Kbd>
                {idx !== hotkey.length - 1 && <span>+</span>}
              </React.Fragment>
            );
          })}
        </KbdGroup>
      </TooltipContent>
    </Tooltip>
  );
}

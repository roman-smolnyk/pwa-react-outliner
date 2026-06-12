import { cn } from "@/lib/utils";
import { useEffect, useState, type ComponentProps } from "react";
import { copyToClipboard } from "../../api/api";

export default function Spoiler({ className = "", children, ...props }: ComponentProps<"span">) {
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    if (isRevealed) {
      console.debug("Spoiler:useEffect");
      const timeoutId = setTimeout(() => setIsRevealed(false), 30 * 1000);

      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [isRevealed]);

  return (
    <span
      className={cn(
        `inline relative transition-all`,
        isRevealed ? "bg-transparent text-current" : "bg-primary text-transparent cursor-pointer",
        className,
      )}
      title={isRevealed ? undefined : "Click to reveal spoiler"}
      {...props}
      onPointerDownCapture={async (e) => {
        if (!isRevealed) {
          e.preventDefault();
          e.stopPropagation();

          setIsRevealed(true);
          await copyToClipboard(String(children));
        }
      }}
    >
      {children}
    </span>
  );
}

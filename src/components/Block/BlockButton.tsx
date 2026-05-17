import React from "react";

const BlockButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    children: React.ReactNode;
    className?: string;
  }
>(({ children, className = "", ...props }, ref) => {
  return (
    <button
      ref={ref}
      type="button"
      className={`BlockButton flex-none size-5 mt-1 cursor-pointer flex items-center justify-center ${className}`}
      {...props}
    >
      {children}
    </button>
  );
});
BlockButton.displayName = "BlockButton";

export default BlockButton;

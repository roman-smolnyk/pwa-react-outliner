import React from "react";

const SecondaryButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    children: React.ReactNode;
    className?: string;
  }
>(({ children, className = "", ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={`inline-block py-1 px-2 rounded cursor-pointer
                bg-secondary text-secondary-foreground border border-border
                hover:scale-105 active:scale-100 transition-transform
                ${className}`}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
});
SecondaryButton.displayName = "SecondaryButton";

export default SecondaryButton;

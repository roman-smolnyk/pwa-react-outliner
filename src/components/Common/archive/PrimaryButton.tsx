import React from "react";

// React.forwardRef is redundunt
const PrimaryButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    children: React.ReactNode;
    className?: string;
  }
>(({ children, className = "", ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={`inline-block p-1 rounded
                bg-primary text-primary-foreground cursor-pointer
                hover:scale-105 active:scale-100 transition-transform
                ${className}`}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
});
PrimaryButton.displayName = "PrimaryButton";

export default PrimaryButton;

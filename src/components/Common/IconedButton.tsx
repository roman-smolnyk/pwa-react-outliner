import React from "react";

const IconedButton = React.forwardRef<
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
      className={`Button flex-none text-primary cursor-pointer 
                *:transition active:*:scale-90 *:pointer-events-none
                flex items-center justify-center 
                ${className}`}
      {...props}
    >
      {children}
    </button>
  );
});
IconedButton.displayName = "IconedButton";

export default IconedButton;

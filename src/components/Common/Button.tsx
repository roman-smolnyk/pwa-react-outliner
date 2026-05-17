import React from "react";

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    children: React.ReactNode;
    className?: string;
  }
>(({ children, className = "", ...props }, ref) => {
  return (
    <button ref={ref} type="button" className={`Button cursor-pointer active:scale-90 transition ${className}`} {...props}>
      {children}
    </button>
  );
});
Button.displayName = "Button";

export default Button;

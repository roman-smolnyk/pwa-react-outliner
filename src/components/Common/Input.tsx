import React from "react";

const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & {
    className?: string;
  }
>(({ className = "", ...props }, ref) => {
  return (
    <input
      className={`Input w-full flex-1 px-2 py-1
                rounded border border-input focus:outline-none focus:ring-1 focus:ring-ring ${className}`}
      ref={ref}
      type="text"
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="none"
      spellCheck="false"
      {...props}
    />
  );
});
Input.displayName = "Input";

export default Input;

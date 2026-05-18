//
export default function FloatingMenuButton({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { className: string }) {
  return (
    <button
      className={`FloatingMenuButton px-3 py-1 hover:bg-accent hover:text-accent-foreground flex items-center gap-3 [&_svg]:size-5! [&_svg]:text-popover-foreground ${className}`}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}

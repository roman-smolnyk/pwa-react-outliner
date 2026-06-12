//
export default function FloatingMenuButton({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { className: string }) {
  return (
    <button
      className={`FloatingMenuButton px-2 py-0.5 hover:bg-accent hover:text-accent-foreground flex items-center gap-1 [&_svg]:size-5! [&_svg]:text-popover-foreground ${className}`}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}

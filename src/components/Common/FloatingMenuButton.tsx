//
export default function FloatingMenuButton({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { className: string }) {
  return (
    <button className={`FloatingMenuButton px-3 py-1 hover:bg-theme-bg-hover flex items-center gap-3 ${className}`} type="button" {...props}>
      {children}
    </button>
  );
}

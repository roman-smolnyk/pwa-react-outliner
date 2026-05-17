//
export default function FloatingMenuItem({
  icon,
  label,
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { icon: React.ReactNode; label: string }) {
  return (
    <button type="button" className={`p-1 hover:bg-theme-bg-hover flex gap-2 items-center ${className ?? ""}`} {...props}>
      <div className="size-5 text-theme-icon">{icon}</div>
      <span className="">{label}</span>
      {children}
    </button>
  );
}

//
export default function FloatingMenuItem({
  icon,
  label,
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { icon: React.ReactNode; label: string }) {
  return (
    <button type="button" className={`p-1 text-gray-700 hover:bg-gray-200 flex gap-2 items-center ${className ?? ""}`} {...props}>
      <div className="size-6 sm:size-5">{icon}</div>
      <span className="text-base sm:text-sm">{label}</span>
      {children}
    </button>
  );
}

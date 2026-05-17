//
export default function Button({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button type="button" className={`text-theme-icon cursor-pointer active:scale-90 transition ${className ?? ""}`} {...props}>
      {children}
    </button>
  );
}

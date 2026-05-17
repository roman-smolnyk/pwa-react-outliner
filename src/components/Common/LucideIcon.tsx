// import type { LucideIcon } from "lucide-react";

// export default function LucideIcon({ icon: Icon, className = "" }: { icon: React.ComponentType<any>; className?: string }) {
//   return <div className={`size-6 max-sm:size-8 text-theme-icon ${className}`}>{<Icon className="w-full h-full" />}</div>;
// }

// className="size-auto! [&>svg]:w-auto! [&>svg]:h-auto!"
export default function LucideIcon({
  icon,
  children,
  className = "",
}: {
  className?: string;
} & ({ icon: React.ReactNode; children?: never } | { children: React.ReactNode; icon?: never })) {
  return (
    <div className={`size-6 max-sm:size-7 text-theme-icon [&>svg]:w-full [&>svg]:h-full flex items-center justify-center ${className}`}>
      {icon ?? children}
    </div>
  );
}

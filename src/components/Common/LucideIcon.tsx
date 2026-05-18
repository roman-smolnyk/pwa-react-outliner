// import type { LucideIcon } from "lucide-react";

// className="size-auto! [&>svg]:w-auto! [&>svg]:h-auto!"
export default function LucideIcon({
  icon,
  children,
  className = "",
}: {
  className?: string;
} & ({ icon: React.ReactNode; children?: never } | { children: React.ReactNode; icon?: never })) {
  return (
    <div className={`size-6 max-sm:size-6.5 [&>svg]:w-full [&>svg]:h-full flex items-center justify-center ${className}`}>
      {icon ?? children}
    </div>
  );
}

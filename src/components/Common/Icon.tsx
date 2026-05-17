export default function Icon({ icon: LucideIcon }: { icon: React.ComponentType<any> }) {
  return <div className="size-6 max-sm:size-8 text-theme-icon">{<LucideIcon className="w-full h-full" />}</div>;
}

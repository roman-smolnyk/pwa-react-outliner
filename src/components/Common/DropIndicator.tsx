//
export default function DropIndicator() {
  return (
    <div className="relative flex items-center w-full pl-2.5 pr-3">
      <div className="absolute left-1.5 w-3 h-3 rounded-full bg-ring"></div>
      <div className="w-full h-1.5 rounded-full bg-ring"></div>
    </div>
  );
}

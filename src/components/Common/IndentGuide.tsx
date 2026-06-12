import { INDENT } from "../../../config.tsx";
import { memo } from "react";

const IndentGuides = memo(function IndentGuides({ id, depth }: { id: string; depth: number }) {
  if (depth <= 1) return null;

  return (
    <div className="absolute inset-y-0 left-0 pointer-events-none">
      {Array.from({ length: depth - 1 }).map((_, i) => (
        <div
          key={`indent-guide-${id}-${i}`}
          className="absolute top-0 bottom-0 w-px bg-border"
          style={{
            left: `${INDENT * i + INDENT / 2}px`,
          }}
        />
      ))}
    </div>
  );
});
IndentGuides.displayName = "IndentGuides";

export default IndentGuides;

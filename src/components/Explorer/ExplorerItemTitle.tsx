import { Input } from "@/components/ui/input";
import { getItem } from "esm-treero-api";
import { useEffect, useRef, useState } from "react";
import yjs from "../../store/yjsManager";

export default function ExplorerItemTitle({
  id,
  title,
  isRename,
  setIsRename,
  onClick,
}: {
  id: string;
  title: string;
  isRename: boolean;
  setIsRename: (v: boolean) => void;
  onClick: (event: React.PointerEvent<HTMLElement> | React.MouseEvent<HTMLElement>) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(title);

  useEffect(() => {
    const input = ref.current;
    if (!input) return;
    input.focus();
    input.select();
    // place cursor at the beginning
    // input.setSelectionRange(0, 0);
  }, [isRename]);

  function onBlur(event: React.FocusEvent<HTMLInputElement>) {
    const value = event.target.value;
    if (value !== title) {
      const yitem = getItem(yjs.yexplorer, id);
      yitem.set("title", value);
    }
    setIsRename(false);
  }

  return isRename ? (
    <Input
      data-component="ExplorerItemTitle"
      placeholder="Title..."
      ref={ref}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={onBlur}
      onKeyDown={(e) => e.key === "Enter" && e.currentTarget?.blur()}
    />
  ) : (
    <div className="w-full min-w-0 pl-1 py-1 cursor-pointer select-none truncate" onClick={onClick}>
      {title}
    </div>
  );
}

import { Input } from "@/components/ui/input";
import { getItem } from "esm-treero-api";
import { useEffect, useRef, useState } from "react";
import yjs from "../../store/yjsManager";

export function Title({ title }: { title: string }) {
  return <div className="Title w-full py-1 select-none truncate">{title}</div>;
}

export function TitleRename({ id, title, setIsRename }: { id: string; title: string; setIsRename: (v: boolean) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(title);

  useEffect(() => {
    const input = ref.current;
    if (!input) return;
    input.focus();
    input.select();
    // place cursor at the beginning
    // input.setSelectionRange(0, 0);
  }, []);

  function onBlur(event: React.FocusEvent<HTMLInputElement>) {
    const value = event.target.value;
    if (value !== title) {
      const yitem = getItem(yjs.yexplorer, id);
      yitem.set("title", value);
    }
    setIsRename(false);
  }

  return (
    <Input
      className="TitleRename"
      placeholder="Title..."
      ref={ref}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={onBlur}
      onKeyDown={(e) => e.key === "Enter" && e.currentTarget?.blur()}
    />
  );
}

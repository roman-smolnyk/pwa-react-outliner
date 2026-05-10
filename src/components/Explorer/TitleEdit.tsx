import { getItem } from "esm-treero-api";
import { useEffect, useRef, useState } from "react";
import yjs from "../../store/yjsManager";

export default function TitleEdit({ id, title, setIsEdit }: { id: string; title: string; setIsEdit: (v: boolean) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(title);

  useEffect(() => {
    const input = ref.current;
    if (!input) return;
    input.focus();
    // place cursor at the beginning
    input.setSelectionRange(0, 0);
  }, []);

  function onBlur(event: React.FocusEvent<HTMLInputElement>) {
    const value = event.target.value;
    if (value !== title) {
      const yitem = getItem(yjs.yexplorer, id);
      yitem.set("title", value);
    }
    setIsEdit(false);
  }

  return (
    <input
      className="TitleEdit w-full min-w-0 max-w-full rounded-xs border-none outline-none focus:ring-2 focus:ring-gray-400"
      style={{ padding: "0px 6px" }}
      ref={ref}
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={onBlur}
      onKeyDown={(e) => e.key === "Enter" && e.currentTarget?.blur()}
    />
  );
}

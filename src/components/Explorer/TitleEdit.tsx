import { getItem } from "esm-treero-api";
import { useEffect, useRef, useState } from "react";
import yjs from "../../store/yjsManager";
import { Input } from "@/components/ui/input";

export default function TitleEdit({ id, title, setIsRename }: { id: string; title: string; setIsRename: (v: boolean) => void }) {
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
      placeholder="Title..."
      ref={ref}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={onBlur}
      onKeyDown={(e) => e.key === "Enter" && e.currentTarget?.blur()}
    />
    // <input
    //   className="TitleEdit w-full min-w-0 max-w-full py-1
    //             rounded border border-input focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-ring"
    //   style={{ padding: "0px 6px" }}
    //   ref={ref}
    //   type="text"
    //   value={value}
    //   onChange={(e) => setValue(e.target.value)}
    //   onBlur={onBlur}
    //   onKeyDown={(e) => e.key === "Enter" && e.currentTarget?.blur()}
    // />
  );
}

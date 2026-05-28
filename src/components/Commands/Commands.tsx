import { XIcon } from "lucide-react";
import useZustandStore from "../../store/useZustandStore";
import IconedButton from "../Common/IconedButton";
import Input from "../Common/Input";
import LucideIcon from "../Common/LucideIcon";
import { useEffect, useRef, useState } from "react";

const COMMANDS = [
  "First",
  "Second",
  "First",
  "Second",
  "First",
  "Second",
  "First",
  "Second",
  "First",
  "Second",
  "First",
  "Second",
  "First",
  "Second",
  "First",
  "Second",
  "First",
  "Second",
  "First",
  "Second",
  "First",
  "Second",
  "First",
  "Second",
  "First",
  "Second",
  "First",
  "Second",
  "First",
  "Second",
  "First",
  "Second",
  "First",
  "Second",
  "First",
  "Second",
  "First",
  "Second",
  "First",
  "Second",
].sort((a, b) => a.localeCompare(b));

export default function Commands() {
  const refInput = useRef<HTMLInputElement | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    refInput.current?.focus();
  }, []);

  const filteredCommands = COMMANDS.filter((a) => a.toLowerCase().includes(query.toLowerCase()));

  return (
    <div
      className="GlobalSearch fixed inset-0 bg-black/40 z-100"
      onClick={() => {
        useZustandStore.setState({ isGlobalSearchOpened: false });
      }}
    >
      <div
        className="absolute top-15 left-1/2 -translate-x-1/2
                   w-9/10 sm:w-3/4 min-w-80 max-w-160
                   h-auto max-h-6/7
                   rounded-lg text-popover-foreground bg-popover border border-border shadow-2xl
                   flex flex-col"
        onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside modal
      >
        <div className="mx-3 mt-3 flex items-center gap-2 shrink-0">
          <Input ref={refInput} placeholder="Search..." value={query} onChange={(e) => setQuery(e.target.value)} />
          <IconedButton
            onClick={() => {
              useZustandStore.setState({ isGlobalSearchOpened: false });
            }}
          >
            <LucideIcon icon={<XIcon />} />
          </IconedButton>
        </div>

        <div className="min-h-0 mt-2 flex-1 overflow-y-auto overflow-x-hidden wrap-break-word">
          {filteredCommands.length > 0 ? (
            filteredCommands.map((command, i) => (
              <div key={`command-${i}`} className="py-1 px-3 hover:bg-accent hover:text-accent-foreground cursor-pointer">
                {command}
              </div>
            ))
          ) : (
            <div className="text-sm text-muted-foreground py-2 text-center">No commands found.</div>
          )}
        </div>
      </div>
    </div>
  );
}

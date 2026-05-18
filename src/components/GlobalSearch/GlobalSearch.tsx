import { XIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { isMobile, scrollIntoView } from "../../utils/utilities";
import useZustandStore from "../../store/useZustandStore";
import { debounce } from "lodash";
import yjs from "../../store/yjsManager";
import Button from "../Common/Button";
import { handleBlockOpen } from "../../api/api";
import { getItem, getItemParent, getPageByBlockId, isRootItem, traverseItemPath } from "esm-treero-api";
import Input from "../Common/Input";

function extractClips(text: string, query: string, offset = 30) {
  const regex = new RegExp(query, "gi");
  const clips: { text: string; match: string }[] = [];

  let match: any;
  while ((match = regex.exec(text)) !== null) {
    const start = Math.max(0, match.index - offset);
    const end = Math.min(text.length, match.index + match[0].length + offset);

    clips.push({
      text: text.slice(start, end),
      match: match[0],
    });
  }

  // Merge overlapping clips
  const merged: { text: string; match: string }[] = [];
  for (const clip of clips) {
    if (merged.length > 0 && text.indexOf(clip.text) <= text.indexOf(merged[merged.length - 1].text) + merged[merged.length - 1].text.length) {
      // Extend previous clip
      const prev = merged[merged.length - 1];
      const newEnd = Math.max(text.indexOf(prev.text) + prev.text.length, text.indexOf(clip.text) + clip.text.length);
      merged[merged.length - 1].text = text.slice(text.indexOf(prev.text), newEnd);
    } else {
      merged.push(clip);
    }
  }

  return merged;
}

function SearchResultEntry({ id, query }: { id: string; query: string }) {
  const yblock = getItem(yjs.yblocks, id);
  let rootBlockId: string;
  if (isRootItem(yjs.yblocks, id)) {
    rootBlockId = yblock.get("id");
  } else {
    rootBlockId = getItemParent(yjs.yblocks, id).get("id");
  }
  const ypage = getPageByBlockId(yjs.ydoc, rootBlockId);
  const yblocksArray = traverseItemPath(yjs.yblocks, id);
  const yexpentryArray = traverseItemPath(yjs.yexplorer, ypage.get("id"));

  const path1 = yexpentryArray.map((a) => a.get("title")).slice(1);
  const path2 = yblocksArray.map((a) => a.get("content").toString());

  const path = [...path1, ...path2].map((s) => (s.length > 10 ? s.slice(0, 10) + "…" : s));
  console.debug("path", path);

  const content = yblock.get("content").toString();
  const clips = extractClips(content, query, 40); // 40 chars left/right

  return (
    <div
      className="border-b border-border px-1 py-1 hover:bg-accentcursor-pointer"
      onClick={async () => {
        useZustandStore.setState({ isGlobalSearchOpened: false });
        await handleBlockOpen(id);
        // requestAnimationFrame(() => {
        //   setTimeout(() => {
        //     const element = document.querySelector(`.Block[data-block-id="${id}"]`);
        //     const container = document.querySelector(".PageContainer");
        //     if (element && container) {
        //       scrollIntoView(element as HTMLElement, container as HTMLElement);
        //     }
        //   }, 750);
        // });
      }}
    >
      <div className="">
        {clips.length === 0 && <span>{content.slice(0, 80)}…</span>}

        {clips.map((clip, i) => {
          const regex = new RegExp(`(${query})`, "gi");
          const parts = clip.text.split(regex);

          return (
            <span key={i}>
              {i > 0 && <span className="text-muted-foreground"> … </span>}
              {clip.text.startsWith(query) ? "" : "…"}
              {parts.map((p, idx) =>
                regex.test(p) ? (
                  <span key={idx} className="bg-warning">
                    {p}
                  </span>
                ) : (
                  <span key={idx}>{p}</span>
                ),
              )}
              {clip.text.endsWith(query) ? "" : "…"}
            </span>
          );
        })}
      </div>

      <div className="text-sm text-muted-foreground">{path.join("/")}</div>
    </div>
  );
}

export default function GlobalSearch() {
  const refInput = useRef<HTMLInputElement | null>(null);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const debouncedCallback = useCallback(
    debounce((query: string) => {
      if (query.trim().length < 3) return;
      setDebouncedQuery(query.trim().toLowerCase());
    }, 800),
    [],
  );

  useEffect(() => {
    debouncedCallback(query);
  }, [query]);

  const searchResult = useMemo(() => {
    if (!debouncedQuery.trim()) return [];

    const result: string[] = [];
    let index = 0;
    for (const yblock of yjs.yblocks.values()) {
      if (!yblock) continue;
      const content = yblock.get("content").toString();
      if (content.toLowerCase().includes(debouncedQuery)) {
        result.push(yblock.get("id"));
        index++;
      }
      if (index >= 80) break; // Optimisation
    }

    return result;
  }, [debouncedQuery]);

  useEffect(() => {
    refInput.current?.focus();
  }, []);

  return (
    <div
      className="GlobalSearch fixed inset-0 bg-black/40 z-100"
      onClick={() => {
        useZustandStore.setState({ isGlobalSearchOpened: false });
      }}
    >
      <div
        className="absolute top-15 left-1/2 -translate-x-1/2
                   w-9/10 sm:w-3/4 min-w-80 max-w-230 
                   h-6/7
                   p-3
                   rounded-lg text-popover-foreground bg-popover border border-border shadow-2xl
                   flex flex-col"
        onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside modal
      >
        <div className="flex items-center gap-2">
          <Input placeholder="Search..." value={query} onChange={(e) => setQuery(e.target.value)} />
          <Button
            onClick={() => {
              useZustandStore.setState({ isGlobalSearchOpened: false });
            }}
          >
            <XIcon />
          </Button>
        </div>

        <div className="mt-2 flex-1 overflow-y-auto overflow-x-hidden wrap-break-word">
          {searchResult.map((id) => (
            <SearchResultEntry key={`SearchResultEntry-${id}`} id={id} query={debouncedQuery} />
          ))}

          {searchResult.length === 0 && <div className="px-1 py-2 text-sm">No results</div>}
        </div>
      </div>
    </div>
  );
}

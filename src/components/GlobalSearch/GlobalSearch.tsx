import { getItem, getItemParent, getPageByBlockId, isRootItem, traverseItemPath } from "esm-treero-api";
import debounce from "lodash/debounce";
import log from "loglevel";
import { XIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { handleBlockOpen } from "../../api/api";
import useZustandStore from "../../store/useZustandStore";
import yjs from "../../store/yjsManager";
import { FloatingWindow } from "../Common/FloatingWindow";
import IconedButton from "../Common/IconedButton";
import Input from "../Common/Input";
import LucideIcon from "../Common/LucideIcon";

function extractClips(text: string, query: string, offset = 30) {
  const regex = new RegExp(query, "gi");
  const clips: { text: string; match: string }[] = [];

  let match: any = regex.exec(text);
  while (match !== null) {
    const start = Math.max(0, match.index - offset);
    const end = Math.min(text.length, match.index + match[0].length + offset);

    clips.push({
      text: text.slice(start, end),
      match: match[0],
    });

    match = regex.exec(text);
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
  log.debug("path", path);

  const content = yblock.get("content").toString();
  const clips = extractClips(content, query, 40); // 40 chars left/right

  return (
    <div
      className="py-1 px-3 hover:bg-accent hover:text-accent-foreground cursor-pointer"
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

  const isGlobalSearchOpened = useZustandStore((s) => s.isGlobalSearchOpened);

  useEffect(() => {
    setTimeout(() => refInput.current?.focus(), 250);
  }, []);

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

  return (
    <FloatingWindow isOpen={isGlobalSearchOpened} setIsOpen={() => useZustandStore.setState({ isGlobalSearchOpened: false })}>
      {/* Header */}
      <div className="p-3 border-b border-border flex items-center justify-between">
        <div>
          <h3>Global Search</h3>
        </div>
        <IconedButton onClick={() => useZustandStore.setState({ isGlobalSearchOpened: false })}>
          <LucideIcon icon={<XIcon />} />
        </IconedButton>
      </div>

      <div className="px-3 pt-3">
        <Input ref={refInput} placeholder="Search..." value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      <div className="mt-2 flex-1 overflow-y-auto overflow-x-hidden wrap-break-word">
        {searchResult.map((id) => (
          <>
            <SearchResultEntry key={`SearchResultEntry-${id}`} id={id} query={debouncedQuery} />
            <hr className="m-0" />
          </>
        ))}

        {searchResult.length === 0 && <div className="text-sm text-muted-foreground py-2 text-center">No results</div>}
      </div>
    </FloatingWindow>
  );
}

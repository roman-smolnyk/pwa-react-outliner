import { getItem, getItemParent, getPageByBlockId, isRootItem, traverseItemPath } from "esm-treero-api";
import debounce from "lodash/debounce";
import { ChevronDownIcon, ChevronRightIcon, CopyMinusIcon, CopyPlusIcon, FileTextIcon, XIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { handleBlockOpen, toggleGlobalSearch } from "../../api/api";
import useZustandStore from "../../store/useZustandStore";
import yjs from "../../store/yjsManager";
import { FloatingWindow } from "../Common/FloatingWindow";
import IconedButton from "../Common/IconedButton";
import Input from "../Common/Input";
import LucideIcon from "../Common/LucideIcon";

interface Clip {
  text: string;
  startIndex: number;
  hasLeadingEllipsis: boolean;
  hasTrailingEllipsis: boolean;
}

interface BlockMatch {
  id: string;
  clips: Clip[];
  content: string;
  matchCount: number;
}

interface PageGroup {
  pageId: string;
  pageTitle: string;
  path: string[];
  blocks: BlockMatch[];
  totalMatches: number;
}

function escapeRegex(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractClips(text: string, query: string, offset = 45): Clip[] {
  const escaped = escapeRegex(query);
  const regex = new RegExp(escaped, "gi");
  const raw: { start: number; end: number }[] = [];

  for (const m of text.matchAll(regex)) {
    raw.push({
      start: Math.max(0, m.index - offset),
      end: Math.min(text.length, m.index + m[0].length + offset),
    });
  }

  // Merge overlapping windows
  const merged: { start: number; end: number }[] = [];
  for (const r of raw) {
    if (merged.length > 0 && r.start <= merged[merged.length - 1].end) {
      merged[merged.length - 1].end = Math.max(merged[merged.length - 1].end, r.end);
    } else {
      merged.push({ ...r });
    }
  }

  return merged.map(({ start, end }) => ({
    text: text.slice(start, end),
    startIndex: start,
    hasLeadingEllipsis: start > 0,
    hasTrailingEllipsis: end < text.length,
  }));
}

// Count actual regex matches in a string
function countMatches(text: string, query: string): number {
  const escaped = escapeRegex(query);
  return (text.match(new RegExp(escaped, "gi")) ?? []).length;
}

function MatchLine({ clip, query, onClick }: { clip: Clip; query: string; onClick: () => void }) {
  const escaped = escapeRegex(query);
  const splitRe = new RegExp(`(${escaped})`, "gi");
  const parts = clip.text.split(splitRe);

  return (
    <div className="MatchLine group/line min-w-0 hover:bg-accent cursor-pointer flex items-baseline gap-0" onClick={onClick}>
      <span className="flex-1 min-w-0 pl-8 pr-3 py-1 text-sm truncate">
        {clip.hasLeadingEllipsis && <span className="mr-0.5 text-muted-foreground/40 select-none">…</span>}
        {parts.map((part, idx) =>
          idx % 2 === 1 ? (
            <mark key={idx} className="px-0.5 bg-warning text-warning-foreground rounded-xs">
              {part}
            </mark>
          ) : (
            <span key={idx} className="text-muted-foreground group-hover/line:text-foreground">
              {part}
            </span>
          ),
        )}
        {clip.hasTrailingEllipsis && <span className="ml-0.5 text-muted-foreground/40 select-none">…</span>}
      </span>
    </div>
  );
}

function PageGroupSection({ group, query, isCollapsed, onToggle }: { group: PageGroup; query: string; isCollapsed: boolean; onToggle: () => void }) {
  return (
    <div className="PageGroupSection">
      {/* File header */}
      <div
        className="group/header sticky top-0 px-2 py-1 z-10 bg-background hover:bg-accent border-b border-border cursor-pointer flex items-center gap-1.5"
        onClick={onToggle}
      >
        <span className="shrink-0 w-3 text-muted-foreground/60 flex items-center">
          {isCollapsed ? <ChevronRightIcon size={12} /> : <ChevronDownIcon size={12} />}
        </span>
        <FileTextIcon size={13} className="shrink-0 text-muted-foreground" />
        <span className="leading-none truncate flex-1 group-hover/header:text-foreground">{group.pageTitle}</span>
        {group.path.length > 0 && <span className="text text-muted-foreground/50 truncate leading-none">{group.path.join(" / ")}</span>}
        <span className="shrink-0 min-w-5 ml-1 px-1.5 py-1 tabular-nums text-xs text-center bg-accent text-accent-foreground rounded leading-none">
          {group.totalMatches}
        </span>
      </div>

      {/* Match lines */}
      {!isCollapsed && (
        <div className="pb-1">
          {group.blocks.map((block) =>
            block.clips.map((clip, i) => (
              <MatchLine
                key={`clip-${block.id}-${i}`}
                clip={clip}
                query={query}
                onClick={async () => {
                  toggleGlobalSearch();
                  await handleBlockOpen(block.id);
                }}
              />
            )),
          )}
        </div>
      )}
    </div>
  );
}

export default function GlobalSearch() {
  const refInput = useRef<HTMLInputElement | null>(null);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [collapsedPages, setCollapsedPages] = useState<Set<string>>(new Set());

  const isGlobalSearchOpened = useZustandStore((s) => s.isGlobalSearchOpened);

  const close = useCallback(() => {
    useZustandStore.setState({ isGlobalSearchOpened: false });
  }, []);

  // Auto-focus on open
  useEffect(() => {
    refInput.current?.focus();
    setTimeout(() => refInput.current?.focus(), 250);
  }, []);

  const debouncedCallback = useCallback(
    debounce((q: string) => {
      if (q.trim().length < 3) {
        setDebouncedQuery("");
        return;
      }
      setDebouncedQuery(q.trim().toLowerCase());
      setCollapsedPages(new Set()); // Expand all on new search
    }, 500),
    [],
  );

  useEffect(() => {
    debouncedCallback(query);
  }, [query, debouncedCallback]);

  const groupedResults: PageGroup[] = useMemo(() => {
    if (!debouncedQuery) return [];

    const matchingIds: string[] = [];
    for (const yblock of yjs.yblocks.values()) {
      if (!yblock) continue;
      const content = yblock.get("content").toString();
      if (content.toLowerCase().includes(debouncedQuery)) {
        matchingIds.push(yblock.get("id"));
      }
      // if (matchingIds.length >= 80) break;
    }

    const pageMap = new Map<string, PageGroup>();

    for (const id of matchingIds) {
      const yblock = getItem(yjs.yblocks, id);
      if (!yblock) continue;

      const rootBlockId = isRootItem(yjs.yblocks, id) ? yblock.get("id") : getItemParent(yjs.yblocks, id).get("id");

      const ypage = getPageByBlockId(yjs.ydoc, rootBlockId);
      if (!ypage) continue;

      const pageId = ypage.get("id");
      const content = yblock.get("content").toString();
      const clips = extractClips(content, debouncedQuery, 45);
      const matchCount = countMatches(content, debouncedQuery);

      if (!pageMap.has(pageId)) {
        const explorerPath = traverseItemPath(yjs.yexplorer, pageId);
        const path = explorerPath
          .slice(1, -1) // drop root entry and the page itself
          .map((a) => a.get("title") as string)
          .filter(Boolean);

        pageMap.set(pageId, {
          pageId,
          pageTitle: (ypage.get("title") as string) || "Untitled",
          path,
          blocks: [],
          totalMatches: 0,
        });
      }

      const group = pageMap.get(pageId)!;
      group.blocks.push({ id, clips, content, matchCount });
      group.totalMatches += matchCount;
    }

    return Array.from(pageMap.values());
  }, [debouncedQuery]);

  const totalBlocks = groupedResults.reduce((s, g) => s + g.blocks.length, 0);
  const totalMatches = groupedResults.reduce((s, g) => s + g.totalMatches, 0);

  const togglePage = useCallback((pageId: string) => {
    setCollapsedPages((prev) => {
      const next = new Set(prev);
      next.has(pageId) ? next.delete(pageId) : next.add(pageId);
      return next;
    });
  }, []);

  const collapseAll = useCallback(() => {
    setCollapsedPages(new Set(groupedResults.map((g) => g.pageId)));
  }, [groupedResults]);

  const expandAll = useCallback(() => {
    setCollapsedPages(new Set());
  }, []);

  const isAllCollapsed = groupedResults.length > 0 && collapsedPages.size === groupedResults.length;

  return (
    <FloatingWindow isOpen={isGlobalSearchOpened} setIsOpen={close}>
      <div className="GlobalSearch px-3 py-2 border-b border-border flex items-center justify-between gap-2">
        <h3 className="">Global Search</h3>
        <div className="ml-auto flex items-center gap-4 sm:gap-2">
          {groupedResults.length > 0 && (
            <IconedButton title={isAllCollapsed ? "Expand all" : "Collapse all"} onClick={isAllCollapsed ? expandAll : collapseAll}>
              <LucideIcon icon={isAllCollapsed ? <CopyPlusIcon /> : <CopyMinusIcon />} />
            </IconedButton>
          )}
          <IconedButton onClick={close}>
            <LucideIcon icon={<XIcon />} />
          </IconedButton>
        </div>
      </div>

      <div className="px-3 pt-3 pb-2">
        <Input ref={refInput} placeholder="Search…" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      {/* Status bar */}
      <div className="h-5 px-3 pb-1.5 flex items-center">
        {debouncedQuery ? (
          groupedResults.length > 0 ? (
            <span className="text-xs text-muted-foreground leading-none">
              {totalMatches} match{totalMatches !== 1 ? "es" : ""} across {totalBlocks} block{totalBlocks !== 1 ? "s" : ""} in {groupedResults.length}{" "}
              page{groupedResults.length !== 1 ? "s" : ""}
            </span>
          ) : (
            <span className="text-sm text-muted-foreground/60 leading-none">No results for &ldquo;{debouncedQuery}&rdquo;</span>
          )
        ) : query.trim().length > 0 && query.trim().length < 3 ? (
          <span className="text-sm text-muted-foreground/60 leading-none">Type at least 3 characters…</span>
        ) : null}
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden border-t border-border">
        {groupedResults.map((group) => (
          <PageGroupSection
            key={group.pageId}
            group={group}
            query={debouncedQuery}
            isCollapsed={collapsedPages.has(group.pageId)}
            onToggle={() => togglePage(group.pageId)}
          />
        ))}

        {debouncedQuery && groupedResults.length === 0 && (
          <div className="py-10 text-center">
            <p className="text-sm text-muted-foreground">No results</p>
          </div>
        )}

        {!debouncedQuery && (
          <div className="py-10 text-center">
            <p className="text-sm text-muted-foreground/50">Start typing to search</p>
          </div>
        )}
      </div>
    </FloatingWindow>
  );
}

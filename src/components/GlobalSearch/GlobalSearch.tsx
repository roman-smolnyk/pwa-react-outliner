import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { getItem, getItemParent, getPageByBlockId, isRootItem, traverseItemPath } from "esm-treero-api";
import debounce from "lodash/debounce";
import { ChevronDown, ChevronRight, FileText, FoldVertical, UnfoldVertical } from "lucide-react";
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { handleBlockOpen, toggleGlobalSearch } from "../../api/api";
import useStore from "../../store/useStore";
import yjs from "../../store/yjsManager";
import ResponsiveModal from "../Common/ResponsiveModal";

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
    <div
      className="min-w-0 hover:bg-accent hover:text-accent-foreground rounded transition-colors cursor-pointer
                flex items-baseline gap-0"
      onClick={onClick}
    >
      <span className="flex-1 min-w-0 pl-8 pr-3 py-1.5 truncate">
        {clip.hasLeadingEllipsis && <span className="mr-0.5 text-muted-foreground">…</span>}
        {parts.map((part, idx) =>
          idx % 2 === 1 ? (
            <mark key={idx} className="px-0.5 bg-warning text-warning-foreground rounded-xs font-medium">
              {part}
            </mark>
          ) : (
            <span key={idx} className="">
              {part}
            </span>
          ),
        )}
        {clip.hasTrailingEllipsis && <span className="ml-0.5 text-muted-foreground">…</span>}
      </span>
    </div>
  );
}

function PageGroupSection({ group, query, isCollapsed, onToggle }: { group: PageGroup; query: string; isCollapsed: boolean; onToggle: () => void }) {
  return (
    <Collapsible open={!isCollapsed} onOpenChange={onToggle} className="w-full border-b border-border last:border-0">
      <CollapsibleTrigger className="sticky top-0 w-full">
        <div
          className="px-2 py-2 z-10 bg-background hover:bg-accent hover:text-accent-foreground rounded
                    cursor-pointer select-none transition-colors
                    flex items-center gap-2"
        >
          <span className="shrink-0 size-4 text-muted-foreground flex items-center justify-center">
            {isCollapsed ? <ChevronRight /> : <ChevronDown />}
          </span>
          <FileText className="shrink-0 size-4 text-muted-foreground" />
          <p className="flex-1 truncate font-medium text-start">{group.pageTitle}</p>
          <div className="max-w-1/3">
            {group.path.length > 0 && (
              <Breadcrumb>
                <BreadcrumbList className="flex-nowrap overflow-hidden">
                  {group.path.map((item, idx) => {
                    return (
                      <Fragment key={idx}>
                        <BreadcrumbItem>
                          <span className="max-w-20 truncate">{item}</span>
                        </BreadcrumbItem>

                        {group.path.length - 1 !== idx && <BreadcrumbSeparator />}
                      </Fragment>
                    );
                  })}
                </BreadcrumbList>
              </Breadcrumb>
            )}
          </div>
          <span className="shrink-0 min-w-5 h-5 px-1 tabular-nums text-xs font-semibold bg-secondary text-secondary-foreground rounded flex items-center justify-center ">
            {group.totalMatches}
          </span>
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent className="">
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
      </CollapsibleContent>
    </Collapsible>
  );
}

export default function GlobalSearch() {
  const refInput = useRef<HTMLInputElement | null>(null);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [collapsedPages, setCollapsedPages] = useState<Set<string>>(new Set());

  const isGlobalSearchOpen = useStore((s) => s.isGlobalSearchOpen);

  const onOpenChange = useCallback(() => {
    useStore.setState({ isGlobalSearchOpen: false });
  }, []);

  // Auto-focus on entry
  useEffect(() => {
    refInput.current?.focus();
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
      console.log("zebra");
      const next = new Set(prev);
      if (next.has(pageId)) {
        next.delete(pageId);
      } else {
        next.add(pageId);
      }
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
    <ResponsiveModal title="Global Search" open={isGlobalSearchOpen} onOpenChange={onOpenChange}>
      <div className="GlobalSearch min-h-0 flex flex-col gap-2">
        <Input
          ref={refInput}
          placeholder="Search..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
          }}
        />

        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            {debouncedQuery && groupedResults.length > 0 && (
              <span>
                {totalMatches} match{totalMatches !== 1 ? "es" : ""} across {totalBlocks} block{totalBlocks !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          {groupedResults.length > 0 && (
            <Button variant="ghost" onClick={isAllCollapsed ? expandAll : collapseAll}>
              {isAllCollapsed ? (
                <>
                  <UnfoldVertical />
                  Expand all
                </>
              ) : (
                <>
                  <FoldVertical />
                  Collapse all
                </>
              )}
            </Button>
          )}
        </div>

        <Separator />

        <div className="text-sm text-muted-foreground flex items-center justify-center">
          {debouncedQuery ? groupedResults.length === 0 ? <p>No matches found</p> : null : <p>Type at least 3 characters to search globally</p>}
        </div>

        {/* Scrollable Container Wrapper */}
        <div className="flex-1 overflow-y-auto overscroll-contain overflow-x-hidden">
          {groupedResults.map((group) => (
            <PageGroupSection
              key={group.pageId}
              group={group}
              query={debouncedQuery}
              isCollapsed={collapsedPages.has(group.pageId)}
              onToggle={() => togglePage(group.pageId)}
            />
          ))}
        </div>
      </div>
    </ResponsiveModal>
  );
}

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getAllPages, getBlock, getPage, mergePages } from "esm-treero-api";
import { useMemo, useState } from "react";
import { handleBlockMove, handleBlockOpen } from "../../api/api";
import useStore from "../../store/useStore";
import yjs from "../../store/yjsManager";
import type { PageT } from "../../types/types";
import ResponsiveModal from "../Common/ResponsiveModal";

function PageItem({ page, onClose }: { page: PageT; onClose: () => void }) {
  return (
    <Button
      data-component="PageItem"
      variant="ghost"
      size="lg"
      className="justify-start"
      onClick={() => {
        const { itemIdToMove } = useStore.getState();
        if (itemIdToMove) {
          try {
            const yblock = getBlock(yjs.ydoc, itemIdToMove);
            handleBlockMove(yblock.get("id"), page.root_id, -1);
          } catch {
            const ypage = getPage(yjs.ydoc, itemIdToMove);
            mergePages(yjs.ydoc, ypage.get("id"), page.id, -1);
            handleBlockOpen(page.root_id);
          }
        }
        onClose();
      }}
    >
      {page.title}
    </Button>
  );
}

export function MoveTo() {
  const [query, setQuery] = useState("");

  const isMoveToOpen = useStore((s) => s.isMoveToOpen);
  const itemIdToMove = useStore((s) => s.itemIdToMove);

  const pages = useMemo(() => {
    const pages: PageT[] = [];
    for (const ypage of getAllPages(yjs.ydoc)) {
      if (query.trim().length) {
        if (ypage.get("title").includes(query.trim().toLowerCase()) && ypage.get("id") !== itemIdToMove) {
          pages.push(ypage.toJSON() as PageT);
        }
      } else {
        if (ypage.get("id") !== itemIdToMove) {
          pages.push(ypage.toJSON() as PageT);
        }
      }
    }
    return pages;
  }, [query, itemIdToMove]);

  function onClose() {
    useStore.setState({ isMoveToOpen: false, itemIdToMove: null });
  }

  return (
    <ResponsiveModal title="Move To" open={isMoveToOpen} onOpenChange={onClose}>
      <div data-component="MoveTo" className="min-h-0 flex flex-col gap-4">
        <Input
          placeholder="Document name"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
          }}
        />

        <Separator />

        <div className="pr-1 flex flex-col overflow-x-auto overscroll-contain">
          {pages.map((page, idx) => {
            return <PageItem key={`moveto-${idx}`} page={page} onClose={onClose} />;
          })}
        </div>
      </div>
    </ResponsiveModal>
  );
}

import { getAllPages, getBlock, getPage, getPageByRootBlockId, isRootItem, mergePages } from "esm-treero-api";
import { XIcon } from "lucide-react";
import { useMemo, useState } from "react";
import useZustandStore from "../../store/useZustandStore";
import yjs from "../../store/yjsManager";
import type { PageT } from "../../types/types";
import { FloatingWindow } from "../Common/FloatingWindow";
import IconedButton from "../Common/IconedButton";
import Input from "../Common/Input";
import LucideIcon from "../Common/LucideIcon";
import { handleBlockMove, handleBlockOpen } from "../../api/api";

function Page({ page, onClose }: { page: PageT; onClose: () => void }) {
  return (
    <div
      className="hover:bg-accent px-3 py-1"
      onClick={() => {
        const { toMoveId } = useZustandStore.getState();
        if (toMoveId) {
          try {
            const yblock = getBlock(yjs.ydoc, toMoveId);
            handleBlockMove(yblock.get("id"), page.root_id, -1);
          } catch {
            const ypage = getPage(yjs.ydoc, toMoveId);
            mergePages(yjs.ydoc, ypage.get("id"), page.id, -1);
            handleBlockOpen(page.root_id);
          }
        }
        onClose();
      }}
    >
      {page.title}
    </div>
  );
}

export function MoveTo() {
  const [query, setQuery] = useState("");

  const isMoveToOpened = useZustandStore((s) => s.isMoveToOpened);
  const toMoveId = useZustandStore((s) => s.toMoveId);

  const pages = useMemo(() => {
    const pages: PageT[] = [];
    for (const ypage of getAllPages(yjs.ydoc)) {
      if (query.trim().length) {
        if (ypage.get("title").includes(query.trim().toLowerCase()) && ypage.get("id") !== toMoveId) {
          pages.push(ypage.toJSON() as PageT);
        }
      } else {
        if (ypage.get("id") !== toMoveId) {
          pages.push(ypage.toJSON() as PageT);
        }
      }
    }
    return pages;
  }, [query, toMoveId]);

  function onClose() {
    useZustandStore.setState({ isMoveToOpened: false, toMoveId: null });
  }

  return (
    <FloatingWindow isOpen={isMoveToOpened} setIsOpen={() => onClose()}>
      <div className="p-3 border-b border-border flex items-center justify-between">
        <div>
          <h3>Move To</h3>
        </div>
        <IconedButton onClick={() => onClose()}>
          <LucideIcon icon={<XIcon />} />
        </IconedButton>
      </div>

      <div className="px-3 pb-3 pt-5 flex flex-col gap-3">
        <div className="flex flex-col gap-3">
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
            }}
          />
        </div>
      </div>

      <div className="flex flex-col overflow-x-auto">
        {pages.map((page, idx) => {
          return <Page key={`moveto-${idx}`} page={page} onClose={onClose} />;
        })}
      </div>
    </FloatingWindow>
  );
}

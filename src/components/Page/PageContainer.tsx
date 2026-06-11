import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import useStore from "../../store/useStore";
import yjs from "../../store/yjsManager";
import BlockPath from "../Block/BlockPath";
import Page from "./Page";

export default function PageContainer() {
  // log.debug("PageContainer");
  const rootBlockId = useStore((s) => s.rootBlockId);
  const isPageSearchActive = useStore((s) => s.isPageSearchActive);
  const isChekboxSelectionActive = useStore((s) => s.isCheckboxSelectionActive);

  const yblock = yjs.yblocks.get(rootBlockId);

  if (!yblock) {
    return (
      <Empty>
        <EmptyHeader>
          {/* <EmptyMedia variant="icon">
            <FileTextIcon />
          </EmptyMedia> */}
          <EmptyTitle>No Document Selected</EmptyTitle>
          <EmptyDescription>Open document or create new.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  const addSpace = isPageSearchActive || isChekboxSelectionActive;

  const parentId = yblock.get("parent_id");

  // @container
  // @[800]:
  // @sm:
  return (
    <div
      className="PageContainer flex-1 relative z-0 min-w-xs min-h-0 
                flex flex-col overflow-y-auto overscroll-contain"
    >
      <div className={`flex-1 w-full md:w-3/4 max-w-3xl px-4  mx-auto ${addSpace ? "pt-22" : "pt-12"}`}>
        {parentId && <BlockPath id={rootBlockId} />}
        <Page rootId={rootBlockId} />
        <div className="Spacer h-[50dvh]"></div>
      </div>
    </div>
  );
}

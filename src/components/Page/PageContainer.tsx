import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import useStore from "../../store/useStore";
import yjs from "../../store/yjsManager";
import BlockPath from "../Block/BlockPath";
import Page from "./Page";

export default function PageContainer() {
  // log.debug("PageContainer");
  const rootBlockId = useStore((s) => s.rootBlockId);
  const isPageSearchActive = useStore((s) => s.isPageSearchActive);
  const isCheckboxSelectionActive = useStore((s) => s.isCheckboxSelectionActive);

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

  const addSpace = isPageSearchActive || isCheckboxSelectionActive;

  const parentId = yblock.get("parent_id");

  return (
    <div className="PageContainer h-dvh flex flex-col">
      {/* <div className="Spacer min-h-10"></div> */}
      <div
        className="PageContainer-scroll flex-1 relative z-0 min-w-xs min-h-0 
                flex flex-col overflow-y-auto overscroll-contain"
      >
        <div className={`flex-1 w-full md:w-3/4 max-w-3xl px-4 mx-auto ${addSpace ? "pt-30" : "pt-20"}`}>
          {parentId && <BlockPath id={rootBlockId} />}
          <Page rootId={rootBlockId} />
          <div className="Spacer h-[50dvh]"></div>
        </div>
      </div>
      <div className="Spacer min-h-10"></div>
    </div>
  );
}

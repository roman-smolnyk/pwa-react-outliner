import useZustandStore from "../../store/useZustandStore";
import yjs from "../../store/yjsManager";
import BlockPath from "../Block/BlockPath";
import Page from "./Page";

export default function PageContainer() {
  // log.debug("PageContainer");
  const rootBlockId = useZustandStore((s) => s.rootBlockId);
  const isPageSearchActive = useZustandStore((s) => s.isPageSearchActive);

  const yblock = yjs.yblocks.get(rootBlockId);

  if (!yblock) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-xl">No document selected</div>
      </div>
    );
  }

  const parentId = yblock.get("parent_id");

  // @container
  // @[800]:
  // @sm:
  return (
    <div
      className="PageContainer flex-1 relative z-0 min-w-xs min-h-0 
                flex flex-col overflow-y-auto overscroll-y-contain"
    >
      <div className={`flex-1 w-full md:w-3/4 max-w-3xl pl-3 pr-4 sm:px-5 mx-auto ${isPageSearchActive ? "pt-22" : "pt-12"}`}>
        {parentId && <BlockPath id={rootBlockId} />}
        <Page rootId={rootBlockId} />
        <div className="Spacer h-[50dvh]"></div>
      </div>
    </div>
  );
}

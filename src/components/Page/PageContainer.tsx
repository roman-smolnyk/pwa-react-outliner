import { getBlock, getItem } from "esm-treero-api";
import useZustandStore from "../../store/useZustandStore";
import yjs from "../../store/yjsManager";
import Page from "./Page";
import BlockPath from "../Block/BlockPath";
import { useMemo } from "react";

export default function PageContainer() {
  console.debug("PageContainer");
  const rootBlockId = useZustandStore((s) => s.rootBlockId);

  const yblock = useMemo(() => getItem(yjs.yblocks, rootBlockId), [rootBlockId]);
  const parentId = yblock.get("parent_id");

  return (
    <div className="PageContainer @container flex-1 relative z-0 min-w-xs min-h-0 flex flex-col overflow-y-auto overscroll-y-contain">
      <div
        className="flex-1
                 px-5 w-full @[800px]:w-[800px] mx-auto
                 pt-12 pb-100
                 "
        //  px-5 @sm:px-16 @lg:px-32 @xl:px-56 @2xl:px-70
        // style={{
        //   height: `calc(100dvh - 2.5rem)`, // example if header/footer 2.5rem each
        // }}
      >
        {parentId && <BlockPath id={rootBlockId} />}
        <Page rootId={rootBlockId} />
      </div>
    </div>
  );
}

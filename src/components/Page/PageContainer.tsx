import { getBlock } from "esm-treero-api";
import useZustandStore from "../../store/useZustandStore";
import yjs from "../../store/yjsManager";
import Page from "./Page";
import BlockPath from "../Block/BlockPath";

export default function PageContainer() {
  const rootBlockId = useZustandStore((state) => state.rootBlockId);

  const yblock = getBlock(yjs.ydoc, rootBlockId);
  const parentId = yblock.get("parent_id");

  console.debug("PageContainer", parentId);

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
        {parentId && <BlockPath id={rootBlockId!} />}
        <Page rootId={rootBlockId} />
      </div>
    </div>
  );
}

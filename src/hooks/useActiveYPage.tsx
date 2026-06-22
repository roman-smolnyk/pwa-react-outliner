import useStore from "@/store/useStore";
import yjs from "@/store/yjsManager";
import type { YExpEntryMap } from "esm-treero-api";
import { getPageByBlockId } from "esm-treero-api";

export default function useActiveYPage() {
  const rootBlockId = useStore((s) => s.rootBlockId);

  let activeYPage: YExpEntryMap | undefined;
  try {
    activeYPage = getPageByBlockId(yjs.ydoc, rootBlockId);
  } catch {
    activeYPage = undefined;
  }

  return activeYPage;
}

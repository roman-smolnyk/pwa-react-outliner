import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import log from "loglevel";
import { useEffect, useState } from "react";
import yjs from "../../store/yjsManager";
import Bookmarks from "../Bookmarks/Bookmarks";
import GlobalMenu from "../GlobalMenu/GlobalMenu";
import Explorer from "./Explorer";
import ExplorerHeader from "./ExplorerHeader";

export default function ExplorerContainer() {
  log.debug("ExplorerContainer");
  const [explorerLength, setExplorerLength] = useState(Array.from(yjs.yexplorer.keys()).length);

  useEffect(() => {
    function observer() {
      setExplorerLength(Array.from(yjs.yexplorer.keys()).length);
    }
    yjs.yexplorer.observe(observer);
    return () => {
      yjs.yexplorer.unobserve(observer);
    };
  });

  const rootId = yjs.yaccount.get("root_id")!;

  const EmptyExplorer = () => (
    <Empty>
      <EmptyHeader>
        <EmptyTitle>No Documents</EmptyTitle>
        <EmptyDescription>Create new or sync</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );

  return (
    <div className="ExplorerContainer h-dvh overflow-hidden flex flex-col">
      <div className="flex-1 relative bg-sidebar text-sidebar-foreground z-0 min-h-0 flex flex-col">
        <ExplorerHeader />
        <Tabs defaultValue="explorer" className="h-full min-h-0">
          <div className="px-4 pt-2">
            <TabsList className="w-full">
              <TabsTrigger value="explorer">Explorer</TabsTrigger>
              <TabsTrigger value="bookmarks">Bookmarks</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="explorer" className="min-h-0 pt-5 overflow-y-auto overscroll-contain">
            {explorerLength <= 1 ? <EmptyExplorer /> : <Explorer rootId={rootId} />}
            <div className="Spacer h-[40dvh]"></div>
          </TabsContent>
          <TabsContent value="bookmarks">
            <Bookmarks />
          </TabsContent>
        </Tabs>

        <div className="p-2">
          <GlobalMenu />
        </div>
      </div>

      {/* {isExplorerOpen &&
        isMobile() &&
        createPortal(
          <div
            className="ExplorerShadow fixed top-0 right-0 h-full w-[10dvw] bg-black/40 z-10"
            onClick={() => {
              handleExplorerClose();
            }}
          />,
          document.getElementById("root")!,
        )} */}
    </div>
  );
}

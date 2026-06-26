import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import log from "loglevel";
import yjs from "../../store/yjsManager";
import Bookmarks from "../Bookmarks/Bookmarks";
import Explorer from "../Explorer/Explorer";
import GlobalMenu from "../GlobalMenu/GlobalMenu";
import SidebarHeader from "./SidebarHeader";

export default function Sidebar() {
  log.debug("Sidebar");

  const rootId = yjs.yaccount.get("root_id")!;

  return (
    <div data-component="Sidebar" className="h-dvh overflow-hidden flex flex-col">
      <div className="flex-1 relative bg-sidebar text-sidebar-foreground z-0 min-h-0 flex flex-col">
        <SidebarHeader />
        <Tabs defaultValue="explorer" className="h-full min-h-0">
          <div className="px-4 pt-2">
            <TabsList className="w-full">
              <TabsTrigger value="explorer">Explorer</TabsTrigger>
              <TabsTrigger value="bookmarks">Bookmarks</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="explorer" className="min-h-0 pt-2 overflow-y-auto overscroll-contain">
            <Explorer rootId={rootId} />
            <div className="Spacer h-[40dvh]"></div>
          </TabsContent>
          <TabsContent value="bookmarks" className="min-h-0 pt-2 overflow-y-auto overscroll-contain">
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

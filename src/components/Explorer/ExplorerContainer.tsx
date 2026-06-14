import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import log from "loglevel";
import { ChevronsUpDownIcon, LogOutIcon, SettingsIcon, UserIcon } from "lucide-react";
import { useEffect, useState } from "react";
import useStore from "../../store/useStore";
import yjs from "../../store/yjsManager";
import ResponsiveDropdown from "../Common/ResponsiveDropdown";
import Explorer from "./Explorer";
import ExplorerHeader from "./ExplorerHeader";

export default function ExplorerContainer() {
  log.debug("ExplorerContainer");
  const [explorerLength, setExplorerLength] = useState(Array.from(yjs.yexplorer.keys()).length);

  const username = useStore((s) => s.username);

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

  const Trigger = ({ ...props }) => (
    <Button variant="outline" size="lg" className="py-7 w-full " {...props}>
      <Avatar>
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <div className="flex-1 text-left text-sm leading-tight flex flex-col ">
        <span className="truncate font-medium">{username}</span>
        <span className="truncate text-xs text-muted-foreground">Account</span>
      </div>
      <ChevronsUpDownIcon className="ml-auto" />
    </Button>
  );

  const menuItems = [
    { label: "Profile", icon: UserIcon, onClick: () => console.log("Profile") },
    { label: "Settings", icon: SettingsIcon, onClick: () => console.log("Settings") },
    { label: "Log out", icon: LogOutIcon, onClick: () => console.log("Logout") },
  ];

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
            <Empty>
              <EmptyHeader>
                <EmptyTitle>No Bookmarks</EmptyTitle>
                <EmptyDescription>Coming soon...</EmptyDescription>
              </EmptyHeader>
            </Empty>
          </TabsContent>
        </Tabs>

        <div className="p-2">
          <ResponsiveDropdown Trigger={Trigger} menuItems={menuItems} />
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

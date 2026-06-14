import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import useIsMobile from "@/hooks/useIsMobile";
import log from "loglevel";
import { ChevronsUpDown, LogOutIcon } from "lucide-react";
import { useEffect, useState } from "react";
import useStore from "../../store/useStore";
import yjs from "../../store/yjsManager";
import Explorer from "./Explorer";
import ExplorerHeader from "./ExplorerHeader";

export default function ExplorerContainer() {
  log.debug("ExplorerContainer");
  const [explorerLength, setExplorerLength] = useState(Array.from(yjs.yexplorer.keys()).length);

  const username = useStore((s) => s.username);
  const isMobile = useIsMobile();

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
        <div
          className="flex-1 pt-5 overflow-y-auto overscroll-contain"
          // style={{
          //   height: `calc(100dvh - 2.5rem)`, // example if header/footer 2.5rem each
          // }}
        >
          {explorerLength <= 1 ? <EmptyExplorer /> : <Explorer rootId={rootId} />}
          <div className="Spacer h-[50dvh]"></div>
        </div>

        <div className="p-2">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="outline" size="lg" className="py-7 w-full">
                  <Avatar className="">
                    <AvatarFallback className="">CN</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left text-sm leading-tight  flex flex-col">
                    <span className="truncate font-medium">{username}</span>
                    <span className="truncate text-xs">Account</span>
                  </div>
                  <ChevronsUpDown className="ml-auto" />
                </Button>
              }
            />
            <DropdownMenuContent side={isMobile ? "bottom" : "right"} align="end" sideOffset={4} alignOffset={isMobile ? 0 : 50}>
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <LogOutIcon />
                  Log out
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <LogOutIcon />
                  Log out
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <LogOutIcon />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
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

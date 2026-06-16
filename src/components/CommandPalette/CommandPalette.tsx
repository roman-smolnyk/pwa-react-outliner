import { handleBlockOpen, toggleSettings } from "@/api/api";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import useStore from "@/store/useStore";
import yjs from "@/store/yjsManager";
import type { FlatExplorerT } from "@/types/types";
import { flattenYTree } from "@/utils/utilities";
import { PAGE_TYPE } from "esm-treero-api";
import { FileTextIcon, HardDriveDownloadIcon, PanelLeftIcon, SettingsIcon } from "lucide-react";
import { useEffect, useState } from "react";

// TODO: Add "Recent" section
export default function CommandPalette() {
  // log.debug("CommandPalette")
  const [flattenedTree, setFlattenedTree] = useState<FlatExplorerT>([]);

  const isCommandPaletteOpen = useStore((s) => s.isCommandPaletteOpen);

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setFlattenedTree(flattenYTree(yjs.yexplorer, yjs.yaccount.get("root_id") as string) as FlatExplorerT);
    }
  }, [isCommandPaletteOpen]);

  function onOpenChange(open?: boolean) {
    useStore.setState({ isCommandPaletteOpen: false });
  }

  function runCommand(action: () => void | Promise<void>) {
    onOpenChange();
    action();
  }

  return (
    <div className="Commands flex flex-col gap-4">
      <CommandDialog open={isCommandPaletteOpen} onOpenChange={onOpenChange}>
        <Command>
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>

            <CommandGroup heading="Commands">
              <CommandItem onSelect={() => runCommand(toggleSettings)}>
                <SettingsIcon />
                <span>Settings</span>
              </CommandItem>
              <CommandItem>
                <PanelLeftIcon />
                <span>Sidebar</span>
                <CommandShortcut>⌘B</CommandShortcut>
              </CommandItem>
              <CommandItem>
                <HardDriveDownloadIcon />
                <span>Download Backup</span>
              </CommandItem>
            </CommandGroup>

            <CommandSeparator />

            <CommandGroup heading="Documents">
              {flattenedTree.map((item, idx) => {
                if (item.type !== PAGE_TYPE) return null;
                return (
                  <CommandItem key={`cmd-${idx}`} onSelect={async () => runCommand(async () => await handleBlockOpen(item.root_id as string))}>
                    <FileTextIcon />
                    <span>{item.title}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </div>
  );
}

import { Button } from "@/components/ui/button";
import {
  ArrowDownAZIcon,
  ArrowDownNarrowWideIcon,
  ArrowDownZAIcon,
  EllipsisVerticalIcon,
  FormIcon,
  ForwardIcon,
  InboxIcon,
  LinkIcon,
  MinusIcon,
  PlusIcon,
  PrinterIcon,
  Trash2Icon,
  UploadIcon,
  ZoomInIcon,
} from "lucide-react";
import {
  copyToClipboard,
  handleBlockCollapseAll,
  handleBlockDelete,
  handleBlockExpandAll,
  handleBlockMoveTo,
  handleBlockOpen,
  handleSetAsInbox,
  handleSortBlockChildren,
} from "../../api/api";
import useStore from "../../store/useStore";
import { AdaptiveMenu, AdaptiveMenuItem, AdaptiveMenuSeparator, AdaptiveMenuSub } from "../Common/AdaptiveMenu/AdaptiveMenu"; // Adjust this import path as needed

export function BlockMenu({ id, isRoot }: { id: string; isRoot: boolean }) {
  const isCheckboxSelectionActive = useStore((s) => s.isCheckboxSelectionActive);
  const idToPrint = useStore((s) => s.idToPrint);

  if (idToPrint) {
    return null;
  }

  const Trigger = ({ ...props }) => (
    <Button data-component="BlockMenu" variant="bare" size="micro" {...props}>
      <EllipsisVerticalIcon />
    </Button>
  );

  return (
    <AdaptiveMenu Trigger={Trigger} label="Block menu" className="sm:w-max max-sm:no-scrollbar max-sm:overflow-y-auto">
      <AdaptiveMenuItem onClick={() => handleBlockOpen(id)}>
        <ZoomInIcon />
        <span>Zoom in</span>
      </AdaptiveMenuItem>

      <AdaptiveMenuItem disabled={isCheckboxSelectionActive} onClick={() => handleBlockMoveTo(id)}>
        <ForwardIcon />
        <span>Move to</span>
      </AdaptiveMenuItem>

      <AdaptiveMenuItem onClick={() => handleBlockExpandAll(id)}>
        <PlusIcon />
        <span>Expand All</span>
      </AdaptiveMenuItem>

      <AdaptiveMenuItem onClick={() => handleBlockCollapseAll(id)}>
        <MinusIcon />
        <span>Collapse All</span>
      </AdaptiveMenuItem>

      <AdaptiveMenuSub
        item={
          <>
            <ArrowDownNarrowWideIcon />
            <span>Sort</span>
          </>
        }
      >
        <AdaptiveMenuItem onClick={() => handleSortBlockChildren(id)}>
          <ArrowDownAZIcon />
          <span>Ascending</span>
        </AdaptiveMenuItem>
        <AdaptiveMenuItem onClick={() => handleSortBlockChildren(id, { descending: true })}>
          <ArrowDownZAIcon />
          <span>Descending</span>
        </AdaptiveMenuItem>
      </AdaptiveMenuSub>

      <AdaptiveMenuItem onClick={() => handleSetAsInbox(id)}>
        <InboxIcon />
        <span>Set as Inbox</span>
      </AdaptiveMenuItem>

      <AdaptiveMenuItem>
        <FormIcon />
        <span>Set as Template</span>
      </AdaptiveMenuItem>

      <AdaptiveMenuItem className="text-warning">
        <UploadIcon />
        <span>Export</span>
      </AdaptiveMenuItem>

      <AdaptiveMenuItem onClick={() => useStore.setState({ idToPrint: id })}>
        <PrinterIcon />
        <span>Print</span>
      </AdaptiveMenuItem>

      <AdaptiveMenuItem onClick={() => copyToClipboard(`${window.location.origin}/#${id}`)}>
        <LinkIcon />
        <span>Copy link</span>
      </AdaptiveMenuItem>

      <AdaptiveMenuSeparator />

      <AdaptiveMenuItem destructive disabled={isCheckboxSelectionActive} onClick={() => handleBlockDelete(id)}>
        <Trash2Icon />
        <span>Delete</span>
      </AdaptiveMenuItem>
    </AdaptiveMenu>
  );
}

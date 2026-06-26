import { Button } from "@/components/ui/button";
import { ForwardIcon, Trash2Icon } from "lucide-react";
import { handleBlockDeleteBatch } from "../../api/api";
import FloatingToolbar from "../Common/FloatingToolbar";

export default function CheckboxSelectionToolbar() {
  return (
    <FloatingToolbar>
      <Button variant="ghost" size="icon-lg">
        <ForwardIcon />
      </Button>

      <Button
        variant="ghost"
        size="icon-lg"
        className="text-destructive hover:text-destructive hover:bg-destructive/20 dark:hover:bg-destructive/30"
        onClick={() => {
          handleBlockDeleteBatch();
        }}
      >
        <Trash2Icon />
      </Button>
    </FloatingToolbar>
  );
}

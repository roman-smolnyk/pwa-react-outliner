import { Button } from "@/components/ui/button";
import { ForwardIcon, Trash2Icon } from "lucide-react";
import { handleBlockDeleteBatch } from "../../api/api";
import FloatingToolbar from "../Common/FloatingToolbar";

export default function CheckboxSelectionToolbar() {
  return (
    <FloatingToolbar className="CheckboxSelectionToolbar">
      <Button variant="ghost" size="icon">
        <ForwardIcon />
      </Button>

      <Button
        variant="destructive"
        size="icon"
        onClick={() => {
          handleBlockDeleteBatch();
        }}
      >
        <Trash2Icon />
      </Button>
    </FloatingToolbar>
  );
}

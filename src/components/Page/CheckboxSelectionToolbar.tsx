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
        variant="destructive"
        size="icon-lg"
        onClick={() => {
          handleBlockDeleteBatch();
        }}
      >
        <Trash2Icon />
      </Button>
    </FloatingToolbar>
  );
}

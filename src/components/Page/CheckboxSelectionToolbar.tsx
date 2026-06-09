import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ForwardIcon, Trash2Icon } from "lucide-react";
import { handleBlockDeleteBatch } from "../../api/api";

export default function CheckboxSelectionToolbar() {
  return (
    <div
      className="CheckboxSelectionToolbar fixed top-15 sm:top-11 left-0 right-0 flex items-center"
      style={{
        left: `var(--explorer-width)`,
      }}
    >
      <div className="w-max mx-auto">
        <Card className="p-2 flex flex-row gap-2">
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
        </Card>
      </div>
    </div>
  );
}

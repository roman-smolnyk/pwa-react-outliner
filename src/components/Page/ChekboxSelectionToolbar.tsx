import { ForwardIcon, MoveIcon, Trash2Icon } from "lucide-react";
import IconedButton from "../Common/IconedButton";
import LucideIcon from "../Common/LucideIcon";
import { handleBlockDeleteBatch } from "../../api/api";

export default function ChekboxSelectionToolbar() {
  return (
    <div
      className="ChekboxSelectionToolbar fixed top-15 sm:top-11 left-0 right-0 flex items-center"
      style={{
        left: `var(--explorer-width)`,
      }}
    >
      <div
        className="w-max mx-auto p-2
                  rounded-lg text-popover-foreground bg-popover border border-border
                  flex items-center gap-4 sm:gap-2"
      >
        <IconedButton>
          <LucideIcon icon={<ForwardIcon />} />
        </IconedButton>
        <IconedButton
          onClick={() => {
            handleBlockDeleteBatch();
          }}
        >
          <LucideIcon icon={<Trash2Icon className="text-error" />} />
        </IconedButton>
      </div>
    </div>
  );
}

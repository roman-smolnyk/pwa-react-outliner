import { handleExplorerToggle, handleRedo, handleUndo, toggleCommandPalette, toggleGlobalSearch, togglePageSearch } from "@/api/api";
import { useHotkeys } from "react-hotkeys-hook";
// import { useHotkeys } from "@tanstack/react-hotkeys";

export default function useSetupHotkeys() {
  useHotkeys("mod+z", () => handleUndo());
  useHotkeys("mod+shift+z", () => handleRedo());
  useHotkeys("mod+f", () => togglePageSearch(), {
    preventDefault: true,
    enableOnFormTags: true,
  });
  useHotkeys("mod+shift+f", () => toggleGlobalSearch(), {
    preventDefault: true,
    enableOnFormTags: true,
  });
  useHotkeys("mod+b", () => handleExplorerToggle(), {
    preventDefault: true,
  });
  useHotkeys("mod+k", () => toggleCommandPalette(), {
    preventDefault: true,
  });
}

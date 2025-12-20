import PWABadge from "../PWABadge.tsx";
import OutlineDocument from "../components/documentComp.tsx";
import { FooterComponent, HeaderComponent } from "../components/headerFooterComp.tsx";
import ExplorerComponent from "./explorerComp.tsx";
import { ReadOnlyContextProvider } from "../etc/readonlyContext.tsx";
import { useHotkeys } from "react-hotkeys-hook";
import { TreeRoAPI } from "../api";
import { ToastContainer } from "react-toastify";

export default function MainAppComponent() {
  useHotkeys("ctrl+z, meta+z", () => {
    console.warn("ctrl+z, meta+z");
    TreeRoAPI.Yjs.undoManager.undo();
  });
  useHotkeys("ctrl+shift+z, meta+shift+z", () => {
    console.warn("ctrl+shift+z, meta+shift+z");
    TreeRoAPI.Yjs.undoManager.redo();
  });

  return (
    <ReadOnlyContextProvider>
      <div className="flex h-screen overflow-hidden">
        <div className="shrink-0">
          <ExplorerComponent />
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          <HeaderComponent />
          <div className="flex-1 overflow-y-auto min-w-0">
            <OutlineDocument />
          </div>
          
        </div>
        <ToastContainer position="top-right" autoClose={3_000} hideProgressBar={true} closeButton={true} style={{ top: 50 }} />
        <PWABadge />
      </div>
      <FooterComponent />
    </ReadOnlyContextProvider>
  );
}

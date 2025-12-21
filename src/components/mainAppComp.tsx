import { useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { ToastContainer } from "react-toastify";
import PWABadge from "../PWABadge.tsx";
import { TreeRoAPI } from "../api";
import OutlineDocument from "../components/documentComp.tsx";
import { FooterComponent, HeaderComponent } from "../components/headerFooterComp.tsx";
import { ReadOnlyContextProvider } from "../etc/readonlyContext.tsx";
import ExplorerComponent from "./explorerComp.tsx";


function SpinnerComponent() {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
    </div>
  );
}

export default function MainAppComponent() {
  const [loading, setLoading] = useState(true);

  useHotkeys("ctrl+z, meta+z", () => {
    console.warn("ctrl+z, meta+z");
    TreeRoAPI.Yjs.undoManager.undo();
  });
  useHotkeys("ctrl+shift+z, meta+shift+z", () => {
    console.warn("ctrl+shift+z, meta+shift+z");
    TreeRoAPI.Yjs.undoManager.redo();
  });

  useEffect(() => {
    TreeRoAPI.initialize(() => {
      setLoading(false);
      // document.querySelector("#root > .spinner")?.remove();
    });
  }, []);

  if (loading) {
    return <SpinnerComponent />;
  }

  return (
    <ReadOnlyContextProvider>
      <HeaderComponent />
      <div
        className="flex h-screen overflow-hidden
      text-lg md:text-base"
      >
        <ExplorerComponent />
        <OutlineDocument />
      </div>
      <FooterComponent />
      <ToastContainer position="top-right" autoClose={3_000} hideProgressBar={true} closeButton={true} style={{ top: 50 }} />
      <PWABadge />
    </ReadOnlyContextProvider>
  );
}

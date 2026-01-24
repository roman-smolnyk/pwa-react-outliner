import { useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { ToastContainer } from "react-toastify";
import PWABadge from "../PWABadge.tsx";
import { TreeRoAPI } from "../api.tsx";
import { ReadOnlyContextProvider } from "../etc/readonlyContext.tsx";
import onStartUp from "../onStartUp.tsx";
import ExplorerComponent from "./ExplorerComp.tsx";
import { FooterComponent, HeaderComponent } from "./HeaderFooterComp.tsx";
import OutlineDocument from "./TreeComp.tsx";

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
    TreeRoAPI.Yjs.undoManager?.undo();
  });
  useHotkeys("ctrl+shift+z, meta+shift+z", () => {
    console.warn("ctrl+shift+z, meta+shift+z");
    TreeRoAPI.Yjs.undoManager?.redo();
  });

  useEffect(() => {
    onStartUp().then(() => {
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
      text-lg sm:text-base"
      >
        <ExplorerComponent />
        <OutlineDocument />
      </div>
      <FooterComponent />
      <ToastContainer
        containerId="main"
        position="top-right"
        autoClose={3_000}
        hideProgressBar={true}
        closeButton={false}
        closeOnClick={true}
        draggable={true}
        limit={3}
        style={{ top: 50 }}
      />
      <PWABadge />
    </ReadOnlyContextProvider>
  );
}

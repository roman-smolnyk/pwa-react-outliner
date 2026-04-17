import { useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { ToastContainer } from "react-toastify";
import PWABadge from "../PWABadge.tsx";
import { ReadOnlyContextProvider, PlainTextViewContextProvider } from "../etc/customContexts.tsx";
import onStartUp from "../onStartUp.tsx";
import ExplorerComponent from "./ExplorerComp.tsx";
import { FooterComponent, HeaderComponent } from "./HeaderFooterComp.tsx";
import TreeRootComponent from "./TreeRootComp.tsx";
import { TreeRoAPI } from "../apis/treeroApi.tsx";
import { useStore } from "../stateStore.tsx";
import { YjsManager } from "esm-treero-api";

function SpinnerComponent() {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
    </div>
  );
}

export default function TreeRoMainComponent() {
  const [loading, setLoading] = useState(true);

  useHotkeys(
    "ctrl+z, meta+z",
    () => {
      console.warn("ctrl+z, meta+z");
      TreeRoAPI.undo();
    },
    // { enableOnContentEditable: true },
  );
  useHotkeys(
    "ctrl+shift+z, meta+shift+z",
    () => {
      console.warn("ctrl+shift+z, meta+shift+z");
      TreeRoAPI.redo();
    },
    { enableOnContentEditable: true },
  );
  useHotkeys(
    "ctrl+f",
    (e) => {
      console.warn("ctrl+f");
      e.preventDefault();
      e.stopPropagation();
      useStore.setState((state) => {
        return { documentSearchIsOpened: !state.documentSearchIsOpened };
      });
    },
    {
      enableOnFormTags: true, // This allows the hotkey to work while inside your search input
    },
  );
  useHotkeys(
    "ctrl+shift+f",
    (e) => {
      console.warn("ctrl+f");
      e.preventDefault();
      e.stopPropagation();
      useStore.setState((state) => {
        return { globalSearchIsOpened: !state.globalSearchIsOpened };
      });
    },
    {
      enableOnFormTags: true, // This allows the hotkey to work while inside your search input
    },
  );

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
      <PlainTextViewContextProvider>
        <HeaderComponent />
        <div
          className="flex h-screen overflow-hidden
                     text-lg sm:text-base"
        >
          <ExplorerComponent />
          <TreeRootComponent />
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
      </PlainTextViewContextProvider>
    </ReadOnlyContextProvider>
  );
}

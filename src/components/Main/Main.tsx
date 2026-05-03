import { ToastContainer } from "react-toastify";
import PWABadge from "../PWA/PWABadge";
import { ReadOnlyContextProvider } from "../../contexts/ReadOnlyContext";
import { PlainTextViewContextProvider } from "../../contexts/PlainTextViewContext";
import { useEffect, useState } from "react";
import onStartUp from "../../onStartUp";
import yjs from "../../store/yjsManager";
import localConfigManager from "../../config/localConfigManager";
import PageWin from "../Page/PageWin";
import useZustandStore from "../../store/useZustandStore";
import { openBlock } from "../../api/api";

export default function Main() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    onStartUp(() => {
      // console.debug("MainComp: setLoaded", true);
      setLoaded(true);
    });
  }, []);

  if (loaded) {
    const yblock = yjs.yblocks.get(localConfigManager.get().currentBlockId);
    if (yblock) {
      openBlock(yblock.get("id"));
    }
  } else {
    return <div className="loading-screen">Loading...</div>;
  }

  return (
    <>
      {/* <HeaderComponent /> */}
      <ReadOnlyContextProvider>
        <PlainTextViewContextProvider>
          <div
            className="Main flex h-screen overflow-hidden
                     text-lg sm:text-base"
          >
            {/* <Explorer /> */}
            <PageWin />
          </div>
        </PlainTextViewContextProvider>
      </ReadOnlyContextProvider>
      {/*  <FooterComponent /> */}
      <ToastContainer
        containerId="toaster"
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
    </>
  );
}

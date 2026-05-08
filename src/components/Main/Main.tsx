import { ToastContainer } from "react-toastify";
import PWABadge from "../PWA/PWABadge";
import { ReadOnlyContextProvider } from "../../contexts/ReadOnlyContext";
import { PlainTextViewContextProvider } from "../../contexts/PlainTextViewContext";
import { useEffect, useState } from "react";
import onStartUp from "../../onStartUp";
import yjs from "../../store/yjsManager";
import PageWin from "../Page/PageWin";
import useZustandStore from "../../store/useZustandStore";
import { openBlock } from "../../api/api";
import localPreferencesManager from "../../store/preferences";

export default function Main() {
  const [loaded, setLoaded] = useState(false);
  const [blockId, setBlockId] = useState("");

  useEffect(() => {
    onStartUp(async () => {
      console.debug("MainComp:setLoaded", true);
      setLoaded(true);
      const localPref = await localPreferencesManager.get();
      console.debug(localPref.rootBlockId)
      setBlockId(localPref.rootBlockId);
    });
  }, []);

  if (loaded && blockId) {
    const yblock = yjs.yblocks.get(blockId);
    if (yblock) {
      openBlock(yblock.get("id"));
    }
  } else {
    console.debug("MAIN", loaded, blockId);
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

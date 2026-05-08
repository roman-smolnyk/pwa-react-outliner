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
import Header from "../Header/Header";
import { LoaderIcon, RefreshCwIcon } from "lucide-react";
import Footer from "../Footer/Footer";

function Spinner() {
  return (
    <div className="h-screen w-screen flex items-center justify-center">
      <LoaderIcon className="animate-spin [animation-duration:2s]" size={50} />
    </div>
  );
}

export default function Main() {
  const [loaded, setLoaded] = useState(false);
  const [blockId, setBlockId] = useState("");

  useEffect(() => {
    onStartUp(async () => {
      console.debug("MainComp:setLoaded", true);
      setLoaded(true);
      const localPref = await localPreferencesManager.get();
      console.debug(localPref.rootBlockId);
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
    return <Spinner />;
  }

  return (
    <div className="Main">
      <ReadOnlyContextProvider>
        <PlainTextViewContextProvider>
          <Header />
          {/* <Explorer /> */}
          <div
            className="PageWin-container h-dvh overflow-hidden
                     text-lg sm:text-base flex flex-col"
          >
            <div className="border min-h-10 sm:min-h-8"></div>

            <PageWin />
            <div className="border min-h-10 sm:min-h-8"></div>
          </div>
          <Footer />
        </PlainTextViewContextProvider>
      </ReadOnlyContextProvider>
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
    </div>
  );
}

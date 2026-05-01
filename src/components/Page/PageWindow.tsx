import { useState, useEffect } from "react";
import { PlainTextViewContextProvider } from "../../contexts/PlainTextViewContext";
import onStartUp from "../../onStartUp";
import yjs from "../../store/yjsManager";
import localConfigManager from "../../config/localConfigManager";
import Page from "./Page";
import { ReadOnlyContextProvider } from "../../contexts/ReadOnlyContext";

export default function PageWindow() {
  console.debug("MainComp");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    onStartUp(() => {
      console.debug("MainComp: setLoaded", true);
      setLoaded(true);
    });
  }, []);

  let rootId: string | undefined;

  if (loaded) {
    const yblock = yjs.yblocks.get(localConfigManager.get().currentBlockId);
    rootId = yblock?.get("id");
  }

  if (!loaded || !rootId) {
    // Returning a spinner or skeleton is better UX than null
    return <div className="loading-screen">Loading...</div>;
  }

  return (
    <ReadOnlyContextProvider>
      <PlainTextViewContextProvider>
        <div
          className="flex h-screen overflow-hidden
                     text-lg sm:text-base"
        >
          <Page rootId={rootId} />
        </div>
      </PlainTextViewContextProvider>
    </ReadOnlyContextProvider>
  );
}

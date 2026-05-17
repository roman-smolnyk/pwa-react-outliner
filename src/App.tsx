import "katex/dist/katex.min.css";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";

// import { Capacitor } from "@capacitor/core";
import { useEffect } from "react";
import treero from "./api/treero";
import Authorization from "./components/Authorize/Authorization";
import Main from "./components/Main/Main";
import PWABadge from "./components/PWA/PWABadge";
import useZustandStore, { hydrateZustandStateWithPreferences } from "./store/useZustandStore";
import { ThemeContextProvider } from "./contexts/ThemeContext";
import { ToastContainer } from "react-toastify";
import { ReadOnlyContextProvider } from "./contexts/ReadOnlyContext";
import { ContentViewModeContextProvider } from "./contexts/PlainTextViewContext";

function App() {
  console.debug("App", treero.version);
  // console.log("Capacitor.isNativePlatform()", Capacitor.isNativePlatform());
  const isHydrated = useZustandStore((s) => s.isHydrated);
  const isAuthorized = useZustandStore((s) => s.isAuthorized);

  useEffect(() => {
    hydrateZustandStateWithPreferences();
  }, []);

  console.debug("isHydrated", isHydrated);
  if (!isHydrated) {
    return null;
  }

  console.debug("isAuthorized", isAuthorized);
  if (!isAuthorized) {
    return (
      <ThemeContextProvider>
        <Authorization />
      </ThemeContextProvider>
    );
  }

  return (
    <ThemeContextProvider>
      <ReadOnlyContextProvider>
        <ContentViewModeContextProvider>
          <Main />
          <PWABadge />
          <ToastContainer
            containerId="toaster"
            position="top-right"
            autoClose={3_000}
            hideProgressBar={true}
            closeButton={false}
            closeOnClick={true}
            draggable={false}
            limit={3}
            style={{ top: 50 }}
            // toastClassName={"min-h-0! h-10! w-60! rounded-xl! top-5! sm:top-0! right-5! sm:right-0!"}
          />
        </ContentViewModeContextProvider>
      </ReadOnlyContextProvider>
    </ThemeContextProvider>
  );
}

export default App;

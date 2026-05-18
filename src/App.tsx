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
import { ThemeProvider } from "./hooks/theme";
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

  return (
    <ThemeProvider>
      <ReadOnlyContextProvider>
        <ContentViewModeContextProvider>
          {isAuthorized ? <Main /> : <Authorization />}
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
            style={{ top: 60 }}
            toastClassName={(context) => {
              console.debug("context", context);
              return `max-w-xs min-w-3xs min-h-0 
                      px-4 py-2.5 mb-2 mr-3 
                      bg-card text-card-foreground text-sm 
                      rounded border border-border shadow 
                      break-words leading-snug
                      ${context?.type === "error" && "text-error"}
                      ${context?.type === "warning" && "text-warning"}
                      ${context?.type === "success" && "text-success"}
                      ${context?.type === "info" && "text-info"}
                      `;
            }}
          />
        </ContentViewModeContextProvider>
      </ReadOnlyContextProvider>
    </ThemeProvider>
  );
}

export default App;

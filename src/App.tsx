import "katex/dist/katex.min.css";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";

// import { Capacitor } from "@capacitor/core";
import log from "loglevel";
import { useEffect } from "react";
import { ToastContainer } from "react-toastify";
import { LOG_LEVEL } from "../config";
import treero from "./api/treero";
import Authorization from "./components/Authorize/Authorization";
import LockScreen from "./components/LockScreen/LockScreen";
import { useAppLockout } from "./components/LockScreen/useAppLockout";
import Main from "./components/Main/Main";
import PWABadge from "./components/PWA/PWABadge";
import { ContentViewModeContextProvider } from "./contexts/PlainTextViewContext";
import { ReadOnlyContextProvider } from "./contexts/ReadOnlyContext";
import { ThemeProvider } from "./hooks/useTheme";
import useZustandStore, { hydrateZustandStateWithPreferences } from "./store/useZustandStore";
import { Toaster } from "@/components/ui/sonner";

function App() {
  console.info(`App`, { version: treero.version, LOG_LEVEL: LOG_LEVEL });
  // log.log("Capacitor.isNativePlatform()", Capacitor.isNativePlatform());
  const isHydrated = useZustandStore((s) => s.isHydrated);
  const isAuthorized = useZustandStore((s) => s.isAuthorized);
  const isLockScreenOpened = useZustandStore((s) => s.isLockScreenOpened);

  useAppLockout();

  useEffect(() => {
    if (!isHydrated) {
      hydrateZustandStateWithPreferences();
    }
  }, [isHydrated]);

  log.debug("isHydrated", isHydrated);
  if (!isHydrated) {
    return null;
  }

  log.debug("isAuthorized", isAuthorized);

  return (
    <ThemeProvider>
      <ReadOnlyContextProvider>
        <ContentViewModeContextProvider>
          {isAuthorized ? isLockScreenOpened ? <LockScreen /> : <Main /> : <Authorization />}
          <PWABadge />
          <Toaster className="top-15!" position="top-right" duration={3_000} />
          {/* <ToastContainer
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
              // log.debug("context", context);
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
          /> */}
        </ContentViewModeContextProvider>
      </ReadOnlyContextProvider>
    </ThemeProvider>
  );
}

export default App;

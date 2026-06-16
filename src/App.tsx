import "katex/dist/katex.min.css";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";

// import { Capacitor } from "@capacitor/core";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import log from "loglevel";
import { useEffect } from "react";
import { LOG_LEVEL } from "../config";
import treero from "./api/treero";
import Authorization from "./components/Authorize/Authorization";
import LockScreen from "./components/LockScreen/LockScreen";
import { useAppLockout } from "./components/LockScreen/useAppLockout";
import Main from "./components/Main/Main";
import PWABadge from "./components/PWA/PWABadge";
import { ContentViewModeContextProvider } from "./contexts/PlainTextViewContext";
import { ReadOnlyContextProvider } from "./contexts/ReadOnlyContext";
import { ConfirmationProvider } from "./hooks/useConfirm";
import { ThemeProvider } from "./hooks/useTheme";
import useStore, { hydrateZustandStateWithPreferences } from "./store/useStore";

function App() {
  console.info(`App`, { version: treero.version, LOG_LEVEL: LOG_LEVEL });
  // log.log("Capacitor.isNativePlatform()", Capacitor.isNativePlatform());
  const isHydrated = useStore((s) => s.isHydrated);
  const isAuthorized = useStore((s) => s.isAuthorized);
  const isLockScreenOpen = useStore((s) => s.isLockScreenOpen);

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
          <TooltipProvider delay={500}>
            <ConfirmationProvider>
              {isAuthorized ? isLockScreenOpen ? <LockScreen /> : <Main /> : <Authorization />}
              <PWABadge />
              <Toaster className="top-15!" position="top-right" duration={3_000} />
            </ConfirmationProvider>
          </TooltipProvider>
        </ContentViewModeContextProvider>
      </ReadOnlyContextProvider>
    </ThemeProvider>
  );
}

export default App;
